const fs = require('fs');
const path = require('path');

// 아이콘 크기 목록
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG 파일 읽기
const svgPath = path.join(__dirname, 'public/assets/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// 각 크기별로 PNG 파일 생성 (실제로는 SVG를 복사)
sizes.forEach(size => {
    const pngPath = path.join(__dirname, `public/assets/icon-${size}x${size}.png`);
    
    // 실제 환경에서는 SVG를 PNG로 변환해야 하지만,
    // 여기서는 SVG 파일을 복사하여 placeholder로 사용
    fs.writeFileSync(pngPath, svgContent);
    console.log(`✅ Generated icon-${size}x${size}.png`);
});

console.log('🎉 All PWA icons generated successfully!');
console.log('Note: These are SVG placeholders. For production, convert to actual PNG files.');
