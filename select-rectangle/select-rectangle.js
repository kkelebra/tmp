import React, { useState, useRef, useCallback } from 'react';

const ImageRectangleSelector = () => {
  const [image, setImage] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const startPoint = useRef({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setSelection(null);
        setCoordinates(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (event) => {
    if (!image) return;
    
    const coords = getCanvasCoordinates(event);
    startPoint.current = coords;
    setIsSelecting(true);
    setSelection({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };

  const handleMouseMove = (event) => {
    if (!isSelecting || !image) return;
    
    const coords = getCanvasCoordinates(event);
    const newSelection = {
      x: Math.min(startPoint.current.x, coords.x),
      y: Math.min(startPoint.current.y, coords.y),
      width: Math.abs(coords.x - startPoint.current.x),
      height: Math.abs(coords.y - startPoint.current.y)
    };
    
    setSelection(newSelection);
    drawCanvas(newSelection);
  };

  const handleMouseUp = () => {
    if (isSelecting && selection) {
      setIsSelecting(false);
      
      // Calcular coordenadas relativas a la imagen original
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      if (img && canvas) {
        const scaleX = img.naturalWidth / canvas.width;
        const scaleY = img.naturalHeight / canvas.height;
        
        const finalCoords = {
          x: Math.round(selection.x * scaleX),
          y: Math.round(selection.y * scaleY),
          width: Math.round(selection.width * scaleX),
          height: Math.round(selection.height * scaleY),
          x2: Math.round((selection.x + selection.width) * scaleX),
          y2: Math.round((selection.y + selection.height) * scaleY)
        };
        
        setCoordinates(finalCoords);
      }
    }
  };

  const drawCanvas = useCallback((currentSelection = selection) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar imagen
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Dibujar rectángulo de selección
    if (currentSelection && (currentSelection.width > 0 || currentSelection.height > 0)) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      
      ctx.fillRect(currentSelection.x, currentSelection.y, currentSelection.width, currentSelection.height);
      ctx.strokeRect(currentSelection.x, currentSelection.y, currentSelection.width, currentSelection.height);
    }
  }, [selection]);

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (canvas && img) {
      // Ajustar el tamaño del canvas manteniendo la proporción
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      drawCanvas();
    }
  };

  const resetSelection = () => {
    setSelection(null);
    setCoordinates(null);
    drawCanvas(null);
  };

  const copyCoordinates = () => {
    if (coordinates) {
      const coordText = `x: ${coordinates.x}, y: ${coordinates.y}, width: ${coordinates.width}, height: ${coordinates.height}`;
      navigator.clipboard.writeText(coordText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Selector de Rectángulo en Imagen
      </h1>
      
      {/* Upload de imagen */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar imagen:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Canvas para la imagen y selección */}
      {image && (
        <div className="mb-6">
          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              src={image}
              alt="Imagen a seleccionar"
              className="hidden"
              onLoad={handleImageLoad}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="cursor-crosshair block mx-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={resetSelection}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              disabled={!selection}
            >
              Limpiar Selección
            </button>
          </div>
        </div>
      )}

      {/* Mostrar coordenadas */}
      {coordinates && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Coordenadas del Rectángulo:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">X:</span> {coordinates.x}px
            </div>
            <div>
              <span className="font-medium">Y:</span> {coordinates.y}px
            </div>
            <div>
              <span className="font-medium">Ancho:</span> {coordinates.width}px
            </div>
            <div>
              <span className="font-medium">Alto:</span> {coordinates.height}px
            </div>
            <div>
              <span className="font-medium">X2:</span> {coordinates.x2}px
            </div>
            <div>
              <span className="font-medium">Y2:</span> {coordinates.y2}px
            </div>
          </div>
          
          <button
            onClick={copyCoordinates}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Copiar Coordenadas
          </button>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Instrucciones:</h4>
        <ul className="space-y-1">
          <li>1. Selecciona una imagen usando el botón de arriba</li>
          <li>2. Haz clic y arrastra sobre la imagen para crear un rectángulo</li>
          <li>3. Las coordenadas se mostrarán automáticamente</li>
          <li>4. Las coordenadas son relativas a la imagen original (tamaño completo)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageRectangleSelector;