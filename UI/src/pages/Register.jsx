import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  X,
  CheckCircle,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  BookOpen,
  AlertCircle,
  Loader,
} from "lucide-react";
import authService from "../services/authService";
import universityService from "../services/universityService";
import departmentService from "../services/departmentService";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "examiner", // Always examiner
    universityId: "",
    departmentId: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const [videoStream, setVideoStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const landmarkerRef = useRef(null);
  const activeLoopRef = useRef(false);
  const eyesClosedRef = useRef(false);
  const blinkCountRef = useRef(0);
  const hasMultipleFacesRef = useRef(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [isLandmarkerLoaded, setIsLandmarkerLoaded] = useState(false);
  const [lastActionText, setLastActionText] = useState("Align Face");
  const [hasMultipleFaces, setHasMultipleFaces] = useState(false);

  // Load universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await universityService.getAllUniversities();
        setUniversities(data);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
        setError(
          "Failed to fetch university details. Please check if the API is running.",
        );
      }
    };
    fetchUniversities();
  }, []);

  // Load departments when university changes
  useEffect(() => {
    const fetchDepartments = async () => {
      console.log("hello");
      if (!formData.universityId) {
        setDepartments([]);
        return;
      }
      try {
        console.log("hello here");
        const data = await departmentService.getDepartmentsByUniversity(
          formData.universityId,
        );
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, [formData.universityId]);

  const stopCamera = () => {
    activeLoopRef.current = false;
    blinkCountRef.current = 0;
    setBlinkCount(0);
    eyesClosedRef.current = false;
    setLastActionText("Align Face");
    hasMultipleFacesRef.current = false;
    setHasMultipleFaces(false);

    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setFormData(prev => ({ ...prev, profileImage: imageData }));
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      setError("");
      setBlinkCount(0);
      blinkCountRef.current = 0;
      eyesClosedRef.current = false;
      setLastActionText("Align Face");
      hasMultipleFacesRef.current = false;
      setHasMultipleFaces(false);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setShowCamera(true);

      if (!landmarkerRef.current) {
        setIsLandmarkerLoaded(false);
        try {
          const { FaceLandmarker, FilesetResolver } = await import(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8"
          );
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
          );
          const landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            outputFaceBlendshapes: true,
            numFaces: 2 // Detect up to 2 faces for safety warning
          });
          landmarkerRef.current = landmarker;
          setIsLandmarkerLoaded(true);
        } catch (mErr) {
          console.error("Failed to load FaceLandmarker, auto-capture disabled:", mErr);
          setIsLandmarkerLoaded(false);
        }
      } else {
        setIsLandmarkerLoaded(true);
      }
    } catch (err) {
      setError(
        "Unable to access camera. Please allow camera permissions or upload an image.",
      );
    }
  };

  const detectLoop = async () => {
    if (!activeLoopRef.current || !landmarkerRef.current || !videoRef.current) return;

    try {
      const video = videoRef.current;
      if (video.readyState >= 2) {
        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        const facesCount = results.faceLandmarks ? results.faceLandmarks.length : 0;

        if (facesCount > 1) {
          if (!hasMultipleFacesRef.current) {
            hasMultipleFacesRef.current = true;
            setHasMultipleFaces(true);
          }
          setLastActionText("Multiple Faces!");
          eyesClosedRef.current = false;
        } else {
          if (hasMultipleFacesRef.current) {
            hasMultipleFacesRef.current = false;
            setHasMultipleFaces(false);
          }

          if (facesCount === 0) {
            setLastActionText("No Face Detected");
            eyesClosedRef.current = false;
          } else {
            // Exactly 1 face, track blinks
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
              const blendshapes = results.faceBlendshapes[0].categories;
              const eyeBlinkLeft = blendshapes.find((b) => b.categoryName === "eyeBlinkLeft")?.score || 0;
              const eyeBlinkRight = blendshapes.find((b) => b.categoryName === "eyeBlinkRight")?.score || 0;

              if (eyeBlinkLeft > 0.4 && eyeBlinkRight > 0.4) {
                if (!eyesClosedRef.current) {
                  eyesClosedRef.current = true;
                  setLastActionText("Blink!");
                }
              } else if (eyeBlinkLeft < 0.2 && eyeBlinkRight < 0.2) {
                if (eyesClosedRef.current) {
                  eyesClosedRef.current = false;
                  blinkCountRef.current += 1;
                  setBlinkCount(blinkCountRef.current);
                  setLastActionText(`Blink ${blinkCountRef.current} detected!`);

                  if (blinkCountRef.current >= 2) {
                    setLastActionText("Capturing...");
                    setTimeout(() => {
                      if (activeLoopRef.current && !hasMultipleFacesRef.current) {
                        capturePhoto();
                      }
                    }, 400);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in face landmark detection loop:", err);
    }

    if (activeLoopRef.current) {
      requestAnimationFrame(detectLoop);
    }
  };

  // Bind video stream and start detection loop when camera is active and video element is mounted
  useEffect(() => {
    if (showCamera && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      if (isLandmarkerLoaded && landmarkerRef.current) {
        activeLoopRef.current = true;
        requestAnimationFrame(detectLoop);
      }
    }
    return () => {
      activeLoopRef.current = false;
    };
  }, [showCamera, videoStream, isLandmarkerLoaded]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.universityId
    ) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    // Email regex validation
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Phone regex validation
    const phoneRegex = /^[0-9]{10}$/;

    // Strong password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError("Phone number must contain exactly 10 numeric digits.");
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      );
      return;
    }
    if (!formData.profileImage) {
      setError("Please capture or upload a profile picture.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: "examiner",
        universityId: parseInt(formData.universityId, 10),
        departmentId: formData.departmentId
          ? parseInt(formData.departmentId, 10)
          : null,
        phone: formData.phone,
        address: formData.address,
        profileImage: formData.profileImage,
      };

      await authService.register(payload);
      setRegistered(true);
    } catch (err) {
      setError(
        err.message ||
          "Registration failed. The email might already be registered.",
      );
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500 shadow-md">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Successful
          </h1>
          <p className="text-gray-700 text-lg font-medium mb-4">
            Awaiting Approval
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8 text-left text-sm text-blue-800 leading-relaxed">
            <p className="font-semibold mb-2">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Your registration has been forwarded to the University
                Coordinator.
              </li>
              <li>
                Once the coordinator approves your account, you will receive
                activation status.
              </li>
              <li>You can then log in using your email and password.</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Examiner Self Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Join as an On-Screen Marking Examiner
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all"
                  placeholder="Prof. John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all"
                  placeholder="john.doe@university.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Create Password *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* University Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University *
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all appearance-none"
                  value={formData.universityId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      universityId: e.target.value,
                      departmentId: "",
                    })
                  }
                  disabled={loading}
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni.universityId} value={uni.universityId}>
                      {uni.universityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  disabled={loading || !formData.universityId}
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <textarea
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 outline-none transition-all"
                placeholder="Department of CS, Building 3, CBC Campus"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Profile Picture Camera Module */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <label className="block text-gray-800 font-bold mb-3">
              Profile Verification Photo *
            </label>

            {showCamera ? (
              <div className="space-y-4">
                <div
                  className="relative rounded-xl overflow-hidden bg-black shadow-inner border border-gray-300"
                  style={{ maxHeight: "300px" }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ minHeight: "240px" }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: "none" }}
                    width="640"
                    height="480"
                  />
                  {/* Smart Auto-Capture Status Overlay */}
                  <div className="absolute top-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md text-white py-2 px-3 rounded-lg flex items-center justify-between text-xs border border-white/10 shadow-lg select-none z-10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLandmarkerLoaded ? (hasMultipleFaces ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse') : 'bg-amber-500 animate-pulse'}`} />
                      <span className="font-semibold text-gray-100">
                        {isLandmarkerLoaded 
                          ? (hasMultipleFaces ? 'Multiple people detected!' : `Blink 2 times to auto-capture (${blinkCount}/2)`) 
                          : 'Loading smart auto-capture...'}
                      </span>
                    </div>
                    {isLandmarkerLoaded && (
                      <span className={`font-bold px-2 py-0.5 rounded border ${
                        hasMultipleFaces 
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : lastActionText === "Blink!" 
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-ping" 
                          : lastActionText.startsWith("Blink") 
                          ? "bg-green-500/20 text-green-300 border-green-500/30" 
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}>
                        {hasMultipleFaces ? "Warning" : lastActionText}
                      </span>
                    )}
                  </div>

                  {/* Multi-Face Block Overlay */}
                  {hasMultipleFaces && (
                    <div className="absolute inset-0 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none animate-fade-in z-20">
                      <span className="text-3xl mb-2">⚠️</span>
                      <h4 className="font-extrabold text-red-200 text-sm">Multiple People Detected!</h4>
                      <p className="text-xs text-red-300 mt-1 max-w-[240px]">
                        Please ensure only one person is in the camera frame to proceed with verification.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={hasMultipleFaces}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2"
                  >
                    Capture verification photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-xl font-semibold transition"
                  >
                    Cancel Camera
                  </button>
                </div>
              </div>
            ) : formData.profileImage ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-gray-300 shadow-md max-w-sm mx-auto">
                  <img
                    src={formData.profileImage}
                    alt="Captured Profile"
                    className="w-full object-cover rounded-xl"
                    style={{ maxHeight: "200px" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, profileImage: "" })
                    }
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Camera size={18} />
                    Retake photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white hover:bg-gray-50 transition cursor-pointer">
                <Camera className="text-gray-400 mb-3" size={36} />
                <p className="text-sm text-gray-600 font-semibold mb-2">
                  Capture or upload verification picture
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Required for coordinator validation
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-2"
                  >
                    <Camera size={16} />
                    Use Webcam
                  </button>
                  <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold border border-gray-300 transition cursor-pointer flex items-center">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Submitting Registration...
                </>
              ) : (
                "Register Account"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl border border-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
