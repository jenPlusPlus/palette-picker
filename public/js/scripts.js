const generateRandomColor = () => {
  const characters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += characters[Math.floor(Math.random() * 16)];
  };
  return color;
};

const assignColors = () => {
  for (let i = 1; i < 6; i++) {
    const color = generateRandomColor();
    $(`#color-${i}`).css('background-color', color);
    $(`#color-hex-${i}`).text(color);
  };
}

window.onload = () => {
  assignColors();
};

$('#generate-palette-button').on('click', assignColors);
