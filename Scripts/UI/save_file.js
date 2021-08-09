// this code is taken from: Rob Kendal
// https://robkendal.co.uk/blog/2020-04-17-saving-text-to-client-side-file-using-vanilla-js

const downloadToFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});
  
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(a.href);
};
//Example Use:
// document.querySelector('#btnSave').addEventListener('click', () => {
//   const textArea = document.querySelector('textarea');
  
//   downloadToFile(textArea.value, 'my-new-file.txt', 'text/plain');
// });