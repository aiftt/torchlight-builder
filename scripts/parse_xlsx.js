const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取Excel文件
const workbook = xlsx.readFile('./docs/火炬之光无限模拟计算器_v1.14b_ss8.xlsx');

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
// const sheet = workbook.Sheets[sheetName];

const json = {}

for (let i = 0; i < workbook.SheetNames.length; i++) {
  const sheetName = workbook.SheetNames[i];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  json[sheetName] = data;
  console.log('表' + sheetName + ' 转换完成！');
}

// 将JSON写入文件
fs.writeFileSync(
  path.join('./public/json/', 'excel-data.json'),
  JSON.stringify(json, null, 2)
);

console.log('转换完成！');