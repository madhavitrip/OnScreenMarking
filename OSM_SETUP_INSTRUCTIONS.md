# On-Screen Marking (OSM) - Setup Instructions

## Installation

### 1. Install Dependencies
```bash
cd UI
npm install react-pdf pdfjs-dist fabric
```

### 2. Verify Installation
```bash
npm list react-pdf pdfjs-dist fabric
```

Expected output:
```
ui@0.0.0
├── fabric@5.x.x
├── pdfjs-dist@4.x.x
└── react-pdf@7.x.x
```

## File Structure

```
UI/
├── src/
│   ├── components/
│   │   └── PDFAnnotator.jsx          ← PDF annotation component
│   ├── pages/
│   │   └── ExaminerMarking.jsx       ← Main marking interface
│   └── services/
│       └── markingService.js         ← API service
└── package.json
```

## Components

### PDFAnnotator.jsx
**Purpose**: Handles PDF viewing and annotation

**Features**:
- PDF rendering
- Drawing tools (pen, text, circle, square, eraser)
- Color picker
- Line width adjustment
- Text selection and copy
- Page navigation
- Annotation tracking

**Props**:
```javascript
<PDFAnnotator 
  pdfUrl="https://example.com/script.pdf"
  onAnnotationsChange={(annotations) => {
    // Handle annotations
  }}
/>
```

**State**:
- `numPages`: Total pages in PDF
- `currentPage`: Current page being viewed
- `tool`: Selected annotation tool
- `color`: Selected color
- `lineWidth`: Line thickness
- `annotations`: Array of all annotations
- `selectedText`: Currently selected text

### ExaminerMarking.jsx
**Purpose**: Main marking interface

**Features**:
- PDF annotation integration
- Question management
- Mark entry
- Annotation linking
- Score tracking
- Remarks management

**State**:
- `markingData`: Script and question data
- `questionMarks`: Marks for each question
- `annotations`: PDF annotations
- `linkedAnnotations`: Map of questions to annotations
- `totalObtained`: Total marks calculated

## Usage

### Basic Setup
```javascript
import ExaminerMarking from './pages/ExaminerMarking';

function App() {
  return <ExaminerMarking />;
}
```

### With Real Data
```javascript
import { useEffect, useState } from 'react';
import ExaminerMarking from './pages/ExaminerMarking';
import markingService from './services/markingService';

function App() {
  const [markingData, setMarkingData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await markingService.getMarkingDetails(1);
      setMarkingData(data);
    };
    loadData();
  }, []);

  if (!markingData) return <div>Loading...</div>;

  return <ExaminerMarking initialData={markingData} />;
}
```

## Configuration

### PDF Worker
The PDF worker is loaded from CDN:
```javascript
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

To use local worker:
```javascript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

### Canvas Settings
```javascript
// Adjust canvas rendering scale
const viewport = page.getViewport({ scale: 1.5 }); // 1.5x zoom
```

## API Integration

### Endpoints Used

**Get Marking Details**
```
GET /api/marking/{markingId}/details
```

**Save Question Marks**
```
POST /api/marking/{markingId}/question-marks
```

**Submit Marking**
```
PUT /api/marking/{markingId}/submit
```

### Example Request
```javascript
const marks = [
  {
    questionId: 1,
    marksAwarded: 2,
    isSkipped: false,
    remarks: "Correct answer",
    isAttempted: true
  }
];

await markingService.saveQuestionMarks(1, marks);
```

## Customization

### Change Colors
```javascript
// In PDFAnnotator.jsx
const [color, setColor] = useState('#FF0000'); // Red
```

### Adjust Line Width Range
```javascript
// In PDFAnnotator.jsx
<input
  type="range"
  min="1"
  max="20"  // Changed from 10
  value={lineWidth}
/>
```

### Add Custom Tools
```javascript
// Add new tool
const [tool, setTool] = useState('pen'); // Add 'arrow', 'highlight', etc.

// Add button
<button onClick={() => setTool('arrow')}>
  <Arrow size={18} />
</button>

// Handle in startDrawing/draw functions
if (tool === 'arrow') {
  // Draw arrow logic
}
```

### Customize Quick Marks
```javascript
// In ExaminerMarking.jsx
<button
  onClick={() => {
    setColor('#00AA00');
    setTool('circle');
  }}
  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
>
  ✓ Correct
</button>
```

## Styling

### Tailwind CSS Classes Used
- `bg-white`, `bg-gray-*`: Backgrounds
- `text-*`: Text colors
- `rounded-lg`: Border radius
- `shadow`: Box shadows
- `p-*`, `m-*`: Padding/margin
- `flex`, `grid`: Layout
- `hover:`, `disabled:`: States

### Custom CSS
```css
/* In PDFAnnotator.jsx */
canvas {
  cursor: crosshair;
  background-color: white;
}

.pdf-container {
  max-height: 600px;
  overflow: auto;
}
```

## Testing

### Manual Testing Checklist
- [ ] PDF loads correctly
- [ ] Can draw on PDF
- [ ] Can add text annotations
- [ ] Can change colors
- [ ] Can adjust line width
- [ ] Can select and copy text
- [ ] Can navigate pages
- [ ] Can enter marks
- [ ] Can link annotations
- [ ] Can skip questions
- [ ] Can save marks
- [ ] Can submit marks
- [ ] Marks calculate correctly
- [ ] Section breakdown updates
- [ ] Percentage displays correctly

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Troubleshooting

### PDF Not Rendering
**Problem**: Canvas is blank
**Solution**:
1. Check PDF URL is accessible
2. Verify CORS headers
3. Check browser console for errors
4. Try different PDF file

### Annotations Not Appearing
**Problem**: Drawn annotations disappear
**Solution**:
1. Check canvas context is initialized
2. Verify mouse events are firing
3. Check z-index of canvas
4. Clear browser cache

### Performance Issues
**Problem**: Slow annotation response
**Solution**:
1. Reduce canvas scale
2. Optimize PDF file size
3. Use debouncing for mouse events
4. Reduce annotation complexity

### Memory Issues
**Problem**: Browser crashes with large PDFs
**Solution**:
1. Reduce PDF resolution
2. Split large PDFs
3. Clear annotations periodically
4. Use web workers

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```
VITE_API_URL=https://api.example.com
VITE_PDF_WORKER_URL=https://cdn.example.com/pdf.worker.min.js
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## Performance Optimization

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const PDFAnnotator = lazy(() => import('./components/PDFAnnotator'));

<Suspense fallback={<div>Loading...</div>}>
  <PDFAnnotator />
</Suspense>
```

### Memoization
```javascript
import { memo } from 'react';

const PDFAnnotator = memo(({ pdfUrl, onAnnotationsChange }) => {
  // Component code
});
```

### Canvas Optimization
```javascript
// Use requestAnimationFrame for smooth drawing
let animationId;

const draw = (e) => {
  animationId = requestAnimationFrame(() => {
    // Drawing logic
  });
};
```

## Support & Documentation

- **React PDF**: https://react-pdf.org/
- **Fabric.js**: http://fabricjs.com/
- **pdfjs-dist**: https://mozilla.github.io/pdf.js/
- **Tailwind CSS**: https://tailwindcss.com/

## Version Information

- React: 19.x
- Vite: 5.x
- Tailwind CSS: 4.x
- react-pdf: 7.x
- pdfjs-dist: 4.x
- fabric: 5.x

## License

This project is licensed under the MIT License.
