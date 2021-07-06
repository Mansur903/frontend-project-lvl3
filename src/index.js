import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';

const schema = yup.string().url();

const addButton = document.querySelector('.btn');
const textField = document.querySelector('.form-control');

function parsing(stringContainingXMLSource) {
  const parser = new DOMParser();
  let doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  console.log(doc);
}

addButton.addEventListener('click', () => {
  textField.classList.remove('border', 'border-2', 'border-danger');
  const inputText = textField.value;
  try {
    schema.validateSync(inputText);
    fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(`${inputText}`)}`)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((data) => parsing(data.contents));
    textField.value = '';
  } catch (e) {
    textField.classList.add('border', 'border-3', 'border-danger');
    console.log(e);
  }
});
