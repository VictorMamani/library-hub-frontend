const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!acceptedTypes.has(file.type)) throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen debe pesar como máximo 5 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error('No pudimos leer esa imagen. Prueba con otra foto.');
    });
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth > 8192 ||
      image.naturalHeight > 8192
    )
      throw new Error('Elige una imagen de hasta 8192 píxeles por lado.');
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no pudo preparar la foto.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
    const photo = canvas.toDataURL('image/jpeg', 0.8);
    if (photo.length > 87406)
      throw new Error('La foto preparada es demasiado grande. Prueba con otra imagen.');
    return photo;
  } finally {
    URL.revokeObjectURL(url);
  }
}
