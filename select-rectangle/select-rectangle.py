import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import pyautogui
import os

class CoordinateIdentifier:
    def __init__(self, root):
        self.root = root
        self.root.title("Identificador de Coordenadas")
        self.root.geometry("800x700")
        
        # Variables
        self.image = None
        self.photo = None
        self.scale_factor = 1.0
        self.original_size = (0, 0)
        
        self.create_widgets()
        
    def create_widgets(self):
        # Frame superior para botones
        button_frame = ttk.Frame(self.root)
        button_frame.pack(pady=10, padx=10, fill='x')
        
        # Botones
        ttk.Button(button_frame, text="Tomar Pantallazo", 
                  command=self.take_screenshot).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Cargar Imagen", 
                  command=self.load_image).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Guardar Pantallazo", 
                  command=self.save_screenshot).pack(side='left', padx=5)
        
        # Frame para información de coordenadas
        info_frame = ttk.Frame(self.root)
        info_frame.pack(pady=5, padx=10, fill='x')
        
        # Labels para mostrar coordenadas
        self.coord_label = ttk.Label(info_frame, text="Coordenadas: (0, 0)", 
                                    font=('Arial', 12, 'bold'))
        self.coord_label.pack(side='left')
        
        self.real_coord_label = ttk.Label(info_frame, text="Coordenadas reales: (0, 0)", 
                                         font=('Arial', 10))
        self.real_coord_label.pack(side='right')
        
        # Frame para el canvas con scrollbars
        canvas_frame = ttk.Frame(self.root)
        canvas_frame.pack(pady=10, padx=10, fill='both', expand=True)
        
        # Canvas con scrollbars
        self.canvas = tk.Canvas(canvas_frame, bg='white', cursor='crosshair')
        
        # Scrollbars
        v_scrollbar = ttk.Scrollbar(canvas_frame, orient='vertical', command=self.canvas.yview)
        h_scrollbar = ttk.Scrollbar(canvas_frame, orient='horizontal', command=self.canvas.xview)
        
        self.canvas.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Grid layout para canvas y scrollbars
        self.canvas.grid(row=0, column=0, sticky='nsew')
        v_scrollbar.grid(row=0, column=1, sticky='ns')
        h_scrollbar.grid(row=1, column=0, sticky='ew')
        
        canvas_frame.grid_rowconfigure(0, weight=1)
        canvas_frame.grid_columnconfigure(0, weight=1)
        
        # Eventos del canvas
        self.canvas.bind('<Motion>', self.on_mouse_move)
        self.canvas.bind('<Button-1>', self.on_click)
        
        # Frame inferior para escala
        scale_frame = ttk.Frame(self.root)
        scale_frame.pack(pady=5, padx=10, fill='x')
        
        ttk.Label(scale_frame, text="Escala:").pack(side='left')
        self.scale_var = tk.DoubleVar(value=1.0)
        scale = ttk.Scale(scale_frame, from_=0.1, to=2.0, variable=self.scale_var, 
                         orient='horizontal', command=self.on_scale_change)
        scale.pack(side='left', fill='x', expand=True, padx=10)
        
        self.scale_label = ttk.Label(scale_frame, text="100%")
        self.scale_label.pack(side='right')
        
    def take_screenshot(self):
        """Toma un pantallazo de toda la pantalla"""
        try:
            # Minimizar la ventana temporalmente
            self.root.withdraw()
            self.root.after(500, self._capture_screen)
        except Exception as e:
            messagebox.showerror("Error", f"Error al tomar pantallazo: {str(e)}")
            self.root.deiconify()
    
    def _capture_screen(self):
        """Captura la pantalla después de un pequeño delay"""
        try:
            screenshot = pyautogui.screenshot()
            self.image = screenshot
            self.original_size = screenshot.size
            self.display_image()
            self.root.deiconify()  # Restaurar la ventana
        except Exception as e:
            messagebox.showerror("Error", f"Error al capturar pantalla: {str(e)}")
            self.root.deiconify()
    
    def load_image(self):
        """Carga una imagen desde archivo"""
        file_path = filedialog.askopenfilename(
            title="Seleccionar imagen",
            filetypes=[
                ("Imágenes", "*.png *.jpg *.jpeg *.bmp *.gif *.tiff"),
                ("Todos los archivos", "*.*")
            ]
        )
        
        if file_path:
            try:
                self.image = Image.open(file_path)
                self.original_size = self.image.size
                self.display_image()
            except Exception as e:
                messagebox.showerror("Error", f"Error al cargar imagen: {str(e)}")
    
    def save_screenshot(self):
        """Guarda el pantallazo actual"""
        if self.image is None:
            messagebox.showwarning("Advertencia", "No hay imagen para guardar.")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="Guardar imagen",
            defaultextension=".png",
            filetypes=[
                ("PNG", "*.png"),
                ("JPEG", "*.jpg"),
                ("Todos los archivos", "*.*")
            ]
        )
        
        if file_path:
            try:
                self.image.save(file_path)
                messagebox.showinfo("Éxito", "Imagen guardada correctamente.")
            except Exception as e:
                messagebox.showerror("Error", f"Error al guardar imagen: {str(e)}")
    
    def display_image(self):
        """Muestra la imagen en el canvas"""
        if self.image is None:
            return
        
        # Calcular el tamaño escalado
        width = int(self.original_size[0] * self.scale_factor)
        height = int(self.original_size[1] * self.scale_factor)
        
        # Redimensionar imagen
        resized_image = self.image.resize((width, height), Image.Resampling.LANCZOS)
        self.photo = ImageTk.PhotoImage(resized_image)
        
        # Limpiar canvas y mostrar imagen
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor='nw', image=self.photo)
        
        # Actualizar región de scroll
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
    
    def on_scale_change(self, value):
        """Maneja el cambio de escala"""
        self.scale_factor = float(value)
        self.scale_label.config(text=f"{int(self.scale_factor * 100)}%")
        self.display_image()
    
    def on_mouse_move(self, event):
        """Maneja el movimiento del mouse sobre el canvas"""
        if self.image is None:
            return
        
        # Obtener coordenadas del canvas
        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)
        
        # Calcular coordenadas reales (sin escala)
        real_x = int(canvas_x / self.scale_factor)
        real_y = int(canvas_y / self.scale_factor)
        
        # Actualizar labels
        self.coord_label.config(text=f"Coordenadas: ({int(canvas_x)}, {int(canvas_y)})")
        self.real_coord_label.config(text=f"Coordenadas reales: ({real_x}, {real_y})")
    
    def on_click(self, event):
        """Maneja el click en el canvas"""
        if self.image is None:
            return
        
        # Obtener coordenadas del canvas
        canvas_x = self.canvas.canvasx(event.x)
        canvas_y = self.canvas.canvasy(event.y)
        
        # Calcular coordenadas reales
        real_x = int(canvas_x / self.scale_factor)
        real_y = int(canvas_y / self.scale_factor)
        
        # Mostrar información en una ventana emergente
        info = f"Coordenadas clickeadas:\n\nCanvas: ({int(canvas_x)}, {int(canvas_y)})\nReales: ({real_x}, {real_y})\nEscala: {int(self.scale_factor * 100)}%"
        messagebox.showinfo("Coordenadas", info)

def main():
    # Verificar dependencias
    try:
        import pyautogui
        import PIL
    except ImportError as e:
        print(f"Error: Falta instalar dependencias.")
        print("Ejecuta: pip install pyautogui pillow")
        return
    
    root = tk.Tk()
    app = CoordinateIdentifier(root)
    root.mainloop()

if __name__ == "__main__":
    main()