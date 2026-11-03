// 临时脚本：为站点 URL 生成二维码，输出为 JS 数据 URI 文件
const QRCode = require('qrcode');
const fs = require('fs');

const SITE_URL = 'https://ka0j1ovo.github.io/where-to-go/';

QRCode.toDataURL(SITE_URL, {
  errorCorrectionLevel: 'M',
  margin: 1,
  width: 320,
  color: { dark: '#1d1d1f', light: '#ffffff' }
}).then(url => {
  const js = '// ============================================================\n' +
    '// 站点二维码（构建时预生成，避免运行时引入二维码库）\n' +
    '// 目标地址：' + SITE_URL + '\n' +
    '// 若站点域名变更，改这里并重新生成本文件即可。\n' +
    '// ============================================================\n' +
    'window.SITE_URL = ' + JSON.stringify(SITE_URL) + ';\n' +
    'window.SITE_QR_DATAURI = ' + JSON.stringify(url) + ';\n';
  fs.writeFileSync('qrdata.js', js, 'utf8');
  console.log('已生成 qrdata.js');
  console.log('URL:', SITE_URL);
  console.log('dataURI 长度:', url.length);
}).catch(e => { console.error(e); process.exit(1); });
