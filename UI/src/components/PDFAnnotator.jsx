import { useState, useRef, useEffect } from 'react';
import { Pen, RotateCcw, Copy, Type, Circle, Square, Upload, ZoomIn, ZoomOut, Check, X, Undo, Move } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFAnnotator = ({ onAnnotationsChange, currentQuestionId, onNextQuestion, maxMarks, sections = [] }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedText, setSelectedText] = useState('');
  const canvasContextRef = useRef(null);
  const [imageSource, setImageSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  const [showMarkPopup, setShowMarkPopup] = useState(false);
  const [markInput, setMarkInput] = useState('');
  const [stepName, setStepName] = useState('');
  const [pendingAnno, setPendingAnno] = useState(null);
  const [isSkipped, setIsSkipped] = useState(false);

  // Sync stepName to first section name when sections are loaded
  useEffect(() => {
    if (sections.length > 0 && !stepName) {
      setStepName(sections[0].name);
    }
  }, [sections]);

  // Redraw everything whenever relevant state changes
  useEffect(() => {
    redrawCanvas();
  }, [imageSource, zoom, canvasSize, pdfPages, currentPage, annotations, currentPath]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvasContextRef.current = context;

    // Set canvas size
    canvas.width = canvasSize.width * zoom;
    canvas.height = canvasSize.height * zoom;

    // Clear canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw PDF page or image
    if (pdfPages.length > 0 && pdfPages[currentPage]) {
      context.drawImage(pdfPages[currentPage], 0, 0, canvas.width, canvas.height);
    } else if (imageSource) {
      context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
    } else {
      // Draw placeholder
      context.fillStyle = '#f0f0f0';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#999';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.fillText('Upload Answer Sheet Image or PDF', canvas.width / 2, canvas.height / 2 - 20);
      context.fillText('(JPG, PNG, PDF)', canvas.width / 2, canvas.height / 2 + 20);
      return;
    }

    // Draw all annotations
    annotations.forEach(anno => {
      drawAnnotation(context, anno);
    });

    // Draw current path if drawing
    if (currentPath.length > 1) {
      drawAnnotation(context, {
        type: 'pen',
        points: currentPath,
        color: color,
        lineWidth: lineWidth
      });
    }
  };

  const drawAnnotation = (ctx, anno) => {
    ctx.strokeStyle = anno.color;
    ctx.fillStyle = anno.color;
    ctx.lineWidth = anno.lineWidth * zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (anno.type) {
      case 'pen':
        if (anno.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(anno.points[0].x * zoom, anno.points[0].y * zoom);
        for (let i = 1; i < anno.points.length; i++) {
          ctx.lineTo(anno.points[i].x * zoom, anno.points[i].y * zoom);
        }
        ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(anno.x * zoom, anno.y * zoom, (anno.lineWidth * 10) * zoom, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'square':
        ctx.strokeRect(anno.x * zoom, anno.y * zoom, (anno.lineWidth * 20) * zoom, (anno.lineWidth * 20) * zoom);
        break;
      case 'tick':
        drawTick(ctx, anno.x * zoom, anno.y * zoom, (anno.lineWidth * 10) * zoom);
        break;
      case 'cross':
        drawCross(ctx, anno.x * zoom, anno.y * zoom, (anno.lineWidth * 10) * zoom);
        break;
      case 'text':
        ctx.font = `${anno.lineWidth * 5 * zoom}px Arial`;
        ctx.fillText(anno.text, anno.x * zoom, anno.y * zoom);
        break;
    }

    // Draw question tag if linked
    if (anno.questionId) {
      ctx.font = `bold ${11 * zoom}px Arial`;
      const isCorrect = anno.type === 'tick' || (anno.marks > 0);
      ctx.fillStyle = isCorrect ? '#008000' : '#FF0000';
      
      const markStr = anno.marks !== undefined ? `(${anno.marks})` : '(?)';
      const qNo = anno.questionId < 10 ? '0' + anno.questionId : anno.questionId;
      const secLabel = anno.stepName ? ` | ${anno.stepName}` : '';
      const label = `${markStr} Q${qNo}${secLabel}`;
      const px = anno.x ? anno.x * zoom : (anno.points?.[0]?.x * zoom);
      const py = anno.y ? anno.y * zoom : (anno.points?.[0]?.y * zoom);
      
      // Draw a small pill background
      const metrics = ctx.measureText(label);
      ctx.fillStyle = isCorrect ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(px - 4, py - 20, metrics.width + 8, 16);
      ctx.strokeStyle = isCorrect ? '#008000' : '#FF0000';
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 4, py - 20, metrics.width + 8, 16);
      
      ctx.fillStyle = isCorrect ? '#008000' : '#FF0000';
      ctx.fillText(label, px, py - 8);
    }
  };

  const drawTick = (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size / 3, y + size);
    ctx.lineTo(x + size, y - size);
    ctx.stroke();
  };

  const drawCross = (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  };

  // Handle image/PDF upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a PDF
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pages.push(canvas);
      }

      setPdfPages(pages);
      setCurrentPage(0);
      setImageSource(null);
      
      if (pages.length > 0) {
        setCanvasSize({ width: pages[0].width, height: pages[0].height });
      }
      return;
    }

    // Handle image files
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageSource(img);
        setPdfPages([]);
        setCanvasSize({ width: img.width, height: img.height });
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (tool === 'move') {
      // Find item to drag
      const item = [...annotations].reverse().find(anno => {
        if (anno.x !== undefined) {
          const dist = Math.sqrt(Math.pow(anno.x - x, 2) + Math.pow(anno.y - y, 2));
          return dist < 30;
        }
        if (anno.points) {
          return anno.points.some(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 20);
        }
        return false;
      });

      if (item) {
        setIsDragging(true);
        setDraggedItem({ ...item, originalIndex: annotations.indexOf(item), offsetX: (item.x || item.points?.[0]?.x) - x, offsetY: (item.y || item.points?.[0]?.y) - y });
      }
      return;
    }

    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }

    if (tool === 'pen') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else {
      // Single click tools
      const newAnno = {
        type: tool,
        x, y,
        color,
        lineWidth,
        questionId: currentQuestionId,
        id: Date.now()
      };
      
      if (tool === 'tick' || tool === 'cross') {
        setPendingAnno(newAnno);
        setShowMarkPopup(true);
        setMarkInput('');
        setIsSkipped(false);
      } else {
        const updated = [...annotations, newAnno];
        setAnnotations(updated);
        onAnnotationsChange?.(updated);
      }
    }
  };

  const draw = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (isDragging && draggedItem) {
      const updated = [...annotations];
      const item = updated[draggedItem.originalIndex];
      if (item.x !== undefined) {
        item.x = x + draggedItem.offsetX;
        item.y = y + draggedItem.offsetY;
      } else if (item.points) {
        const dx = x + draggedItem.offsetX - item.points[0].x;
        const dy = y + draggedItem.offsetY - item.points[0].y;
        item.points = item.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      setAnnotations(updated);
      return;
    }

    if (!isDrawing || tool !== 'pen') return;
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedItem(null);
      onAnnotationsChange?.(annotations);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 1) {
      const newAnno = {
        type: 'pen',
        points: currentPath,
        color,
        lineWidth,
        questionId: currentQuestionId,
        id: Date.now()
      };
      const updated = [...annotations, newAnno];
      setAnnotations(updated);
      onAnnotationsChange?.(updated);
    }
    setCurrentPath([]);
  };

  const handleUndo = () => {
    const updated = annotations.slice(0, -1);
    setAnnotations(updated);
    onAnnotationsChange?.(updated);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const defaultStep = sections.length > 0 ? sections[0].name : '';
    const newAnno = {
      type: 'tick',
      x, y,
      color: '#00AA00',
      lineWidth: 2,
      questionId: currentQuestionId,
      stepName: defaultStep,
      id: Date.now()
    };
    
    setPendingAnno(newAnno);
    setShowMarkPopup(true);
    setMarkInput('');
    setStepName(defaultStep);
    setIsSkipped(false);
  };

  const submitMark = () => {
    if (pendingAnno) {
      const finalMark = parseFloat(markInput) || 0;
      const finalAnno = { 
        ...pendingAnno, 
        marks: finalMark,
        stepName: stepName,
        isSkipped: isSkipped,
        type: isSkipped ? 'cross' : (finalMark > 0 ? 'tick' : 'cross'),
        color: isSkipped ? '#FF6B6B' : (finalMark > 0 ? '#00AA00' : '#FF0000')
      };
      const updated = [...annotations, finalAnno];
      setAnnotations(updated);
      onAnnotationsChange?.(updated);
      setPendingAnno(null);
      setShowMarkPopup(false);
      setMarkInput('');
      setIsSkipped(false);
      
      // Auto advance to next question if successful
      if (onNextQuestion) {
        onNextQuestion();
      }
    }
  };

  const clearCanvas = () => {
    setAnnotations([]);
    onAnnotationsChange?.([]);
  };

  const addTextAnnotation = () => {
    if (!textInput.trim()) return;
    
    const newAnno = {
      type: 'text',
      text: textInput,
      x: textPosition.x,
      y: textPosition.y,
      color,
      lineWidth,
      questionId: currentQuestionId,
      id: Date.now()
    };
    
    const updated = [...annotations, newAnno];
    setAnnotations(updated);
    onAnnotationsChange?.(updated);
    
    setTextInput('');
    setShowTextInput(false);
  };

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      alert('Text copied to clipboard!');
    }
  };

  const handleTextSelection = (e) => {
    const selected = window.getSelection().toString();
    if (selected) {
      setSelectedText(selected);
    }
  };

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-3 space-y-2 border border-gray-200">
        {/* Upload Section */}
        <div className="flex gap-2 items-center border-b border-gray-200 pb-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm cursor-pointer font-semibold transition-colors">
            <Upload size={16} />
            Upload
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <div className="h-4 w-px bg-gray-300 mx-2" />
          <span className="text-xs font-medium text-gray-600">Question: </span>
          <span className="text-xs font-bold text-blue-600">{currentQuestionId || "—"}</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs">
          {/* Main Tools */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => setTool('move')}
              className={`p-2 rounded-lg transition-colors ${tool === 'move' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Move"
            >
              <Move size={16} />
            </button>
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Pen"
            >
              <Pen size={16} />
            </button>
            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded-lg transition-colors ${tool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Text"
            >
              <Type size={16} />
            </button>
            <button
              onClick={() => setTool('tick')}
              className={`p-2 rounded-lg transition-colors ${tool === 'tick' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Tick"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setTool('cross')}
              className={`p-2 rounded-lg transition-colors ${tool === 'cross' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Cross"
            >
              <X size={16} />
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Circle"
            >
              <Circle size={16} />
            </button>
            <button
              onClick={() => setTool('square')}
              className={`p-2 rounded-lg transition-colors ${tool === 'square' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Square"
            >
              <Square size={16} />
            </button>
          </div>

          {/* History */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              title="Undo"
            >
              <Undo size={16} />
            </button>
          </div>

          {/* Color & Size */}
          <div className="flex gap-2 items-center border-r border-gray-300 pr-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300"
            />
            <div className="flex items-center gap-1">
              <input
                type="range"
                min="1"
                max="10"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-600 w-6">{lineWidth}</span>
            </div>
          </div>

          {/* Zoom */}
          <div className="flex gap-1 items-center border-r border-gray-300 pr-2">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><ZoomOut size={16} /></button>
            <span className="w-10 text-center text-xs font-semibold">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"><ZoomIn size={16} /></button>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <button onClick={handleCopy} disabled={!selectedText} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"><Copy size={16} /></button>
            <button onClick={clearCanvas} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><RotateCcw size={16} /></button>
          </div>
        </div>

        {/* Quick Marks */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setColor('#00AA00');
              setTool('tick');
            }}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 font-semibold border border-green-300 transition-colors"
          >
            ✓ Correct
          </button>
          <button
            onClick={() => {
              setColor('#FF0000');
              setTool('cross');
            }}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 font-semibold border border-red-300 transition-colors"
          >
            ✗ Wrong
          </button>
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-200 w-96">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Add Feedback</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && addTextAnnotation()}
            />
            <div className="flex gap-2">
              <button onClick={addTextAnnotation} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">Add</button>
              <button onClick={() => setShowTextInput(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Entry Popup */}
      {showMarkPopup && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg border border-gray-300 shadow-xl w-80 animate-in zoom-in duration-150">
            <div className="bg-gray-50 p-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Section:</p>
              <select 
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                className="w-full text-sm font-semibold p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {sections.length > 0
                  ? sections.map((sec) => (
                      <option key={sec.id} value={sec.name}>{sec.name}</option>
                    ))
                  : <option value="">No sections</option>
                }
              </select>
            </div>
            
            {/* Skip Question Checkbox */}
            <div className="p-3 border-b border-gray-200 bg-orange-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSkipped}
                  onChange={(e) => setIsSkipped(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-orange-900">Mark as Skipped</span>
              </label>
              <p className="text-xs text-orange-700 mt-1 ml-7">Question was not attempted by student</p>
            </div>

            {/* Marks Grid */}
            {!isSkipped && (
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-4 gap-1">
                  {(() => {
                    const options = [];
                    const limit = parseFloat(maxMarks) || 0;
                    for (let i = 0; i <= limit; i += 0.5) {
                      options.push(i);
                    }
                    if (limit > 0 && limit % 0.5 !== 0) {
                      options.push(limit);
                    }
                    return options;
                  })().map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMarkInput(m.toString());
                        const finalAnno = { 
                          ...pendingAnno, 
                          marks: m,
                          stepName: stepName,
                          isSkipped: false,
                          type: m > 0 ? 'tick' : 'cross',
                          color: m > 0 ? '#00AA00' : '#FF0000'
                        };
                        const updated = [...annotations, finalAnno];
                        setAnnotations(updated);
                        onAnnotationsChange?.(updated);
                        setPendingAnno(null);
                        setShowMarkPopup(false);
                        if (onNextQuestion) onNextQuestion();
                      }}
                      className="text-center py-2 hover:bg-blue-600 hover:text-white text-sm font-semibold border border-gray-200 rounded transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 flex gap-2 border-t border-gray-200">
              {isSkipped ? (
                <button 
                  onClick={() => {
                    const finalAnno = { 
                      ...pendingAnno, 
                      marks: 0,
                      stepName: stepName,
                      isSkipped: true,
                      type: 'cross',
                      color: '#FF6B6B'
                    };
                    const updated = [...annotations, finalAnno];
                    setAnnotations(updated);
                    onAnnotationsChange?.(updated);
                    setPendingAnno(null);
                    setShowMarkPopup(false);
                    setIsSkipped(false);
                    if (onNextQuestion) onNextQuestion();
                  }}
                  className="flex-1 text-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
                >
                  Confirm Skip
                </button>
              ) : (
                <>
                  <input
                    type="number"
                    value={markInput}
                    onChange={(e) => setMarkInput(e.target.value)}
                    placeholder="Custom"
                    className="flex-1 text-sm p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && submitMark()}
                  />
                  <button onClick={submitMark} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors">
                    Submit
                  </button>
                </>
              )}
              <button onClick={() => {setShowMarkPopup(false); setPendingAnno(null); setIsSkipped(false);}} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg font-semibold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div
          className="bg-gray-100 overflow-auto flex-1 flex justify-center p-4"
          onMouseUp={handleTextSelection}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onContextMenu={handleContextMenu}
            className={`bg-white shadow-md rounded-lg ${tool === 'move' ? 'cursor-move' : 'cursor-crosshair'}`}
          />
        </div>

        {/* PDF Navigation */}
        {pdfPages.length > 0 && (
          <div className="flex items-center justify-center gap-4 p-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Page {currentPage + 1} of {pdfPages.length}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))}
              disabled={currentPage === pdfPages.length - 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFAnnotator;
