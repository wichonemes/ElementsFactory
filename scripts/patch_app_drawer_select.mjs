import fs from 'fs';

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `          <QuoteDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            settings={settings}
            onTrackWhatsApp={handleTrackWhatsAppQuote}
            onOpenArcade={handleOpenArcade}
          />`;

const newBlock = `          <QuoteDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            settings={settings}
            onTrackWhatsApp={handleTrackWhatsAppQuote}
            onOpenArcade={handleOpenArcade}
            onSelectProduct={(itemProduct) => {
              const fullProd = products.find(p => p.id === itemProduct?.id || p.code === itemProduct?.code) || itemProduct;
              setIsCartOpen(false);
              setSelectedProduct(fullProd);
            }}
          />`;

let norm = content.replace(/\r\n/g, '\n');

if (!norm.includes(oldBlock.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldBlock in App.jsx');
  process.exit(1);
}

norm = norm.replace(oldBlock.replace(/\r\n/g, '\n'), newBlock.replace(/\r\n/g, '\n'));

if (content.includes('\r\n')) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, norm, 'utf8');
console.log('Successfully patched App.jsx');
