import fs from 'fs';

const filePath = 'src/components/ProductDetailModal.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Gallery normalization and 4-slot guarantee
const oldGalleryBlock = `  // Build clean unified gallery list strictly following the 4-photo standard
  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.primaryImage];`;

const newGalleryBlock = `  // Build clean unified gallery list strictly following the 4-photo standard
  const cleanUrl = (u) => (typeof u === 'string' && u.trim() ? u.trim().replace(/^\\.\\//, '/') : '');
  const baseContext = cleanUrl(product.gallery?.[0]) || cleanUrl(product.primaryImage) || cleanUrl(product.contextImage);
  const baseWhite = cleanUrl(product.gallery?.[1]) || cleanUrl(product.whiteBgImage) || baseContext;
  const baseDetail = cleanUrl(product.gallery?.[2]) || cleanUrl(product.detailImage) || baseWhite || baseContext;
  const baseScale = cleanUrl(product.gallery?.[3]) || cleanUrl(product.measureImage) || cleanUrl(product.dimensionsImage) || baseDetail || baseWhite || baseContext;

  const rawGallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery.map(cleanUrl).filter(Boolean)
    : [baseContext].filter(Boolean);

  const gallery = rawGallery.length >= 4
    ? rawGallery
    : [
        rawGallery[0] || baseContext,
        rawGallery[1] || baseWhite,
        rawGallery[2] || baseDetail,
        rawGallery[3] || baseScale
      ].filter(Boolean);`;

// 2. Active image fallback
const oldActiveImage = `  const activeImage = gallery[activeIdx] || product.primaryImage;`;
const newActiveImage = `  const activeImage = gallery[activeIdx] || baseContext;`;

// 3. Main photo onError
const oldMainPhoto = `                <img
                  src={activeImage}
                  srcSet={getOptimizedSrcSet(activeImage)}
                  sizes={HERO_IMAGE_SIZES}
                  alt={\`\${product.name} - \${currentMeta.label}\`}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className={\`w-full h-full transition-all duration-300 select-none \${
                    activeIdx === 0 
                      ? 'object-cover' 
                      : 'object-contain p-2.5 sm:p-4 bg-white'
                  } \${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}\`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />`;

const newMainPhoto = `                <img
                  src={activeImage}
                  srcSet={getOptimizedSrcSet(activeImage)}
                  sizes={HERO_IMAGE_SIZES}
                  alt={\`\${product.name} - \${currentMeta.label}\`}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className={\`w-full h-full transition-all duration-300 select-none \${
                    activeIdx === 0 
                      ? 'object-cover' 
                      : 'object-contain p-2.5 sm:p-4 bg-white'
                  } \${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}\`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.srcset = '';
                    const fb = baseContext || '/brand/artesano_digital_icono.png';
                    if (e.currentTarget.src !== fb) {
                      e.currentTarget.src = fb;
                    }
                  }}
                />`;

// 4. Thumbnail photo onError
const oldThumbPhoto = `                          <img
                            src={imgUrl}
                            srcSet={getOptimizedSrcSet(imgUrl)}
                            sizes="120px"
                            alt=""
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className={\`w-full h-full select-none pointer-events-none \${idx === 0 ? 'object-cover' : 'object-contain p-1'}\`}
                          />`;

const newThumbPhoto = `                          <img
                            src={imgUrl}
                            srcSet={getOptimizedSrcSet(imgUrl)}
                            sizes="120px"
                            alt=""
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className={\`w-full h-full select-none pointer-events-none \${idx === 0 ? 'object-cover' : 'object-contain p-1'}\`}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.srcset = '';
                              const fb = baseContext || '/brand/artesano_digital_icono.png';
                              if (e.currentTarget.src !== fb) {
                                e.currentTarget.src = fb;
                              }
                            }}
                          />`;

let norm = content.replace(/\r\n/g, '\n');

if (!norm.includes(oldGalleryBlock.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldGalleryBlock');
  process.exit(1);
}
norm = norm.replace(oldGalleryBlock.replace(/\r\n/g, '\n'), newGalleryBlock.replace(/\r\n/g, '\n'));

if (!norm.includes(oldActiveImage.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldActiveImage');
  process.exit(1);
}
norm = norm.replace(oldActiveImage.replace(/\r\n/g, '\n'), newActiveImage.replace(/\r\n/g, '\n'));

if (!norm.includes(oldMainPhoto.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldMainPhoto');
  process.exit(1);
}
norm = norm.replace(oldMainPhoto.replace(/\r\n/g, '\n'), newMainPhoto.replace(/\r\n/g, '\n'));

if (!norm.includes(oldThumbPhoto.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldThumbPhoto');
  process.exit(1);
}
norm = norm.replace(oldThumbPhoto.replace(/\r\n/g, '\n'), newThumbPhoto.replace(/\r\n/g, '\n'));

if (content.includes('\r\n')) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, norm, 'utf8');
console.log('Successfully patched ProductDetailModal.jsx');
