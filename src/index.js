import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';

const schema = yup.string().url();

const addButton = document.querySelector('.btn');
const textField = document.querySelector('.form-control');

addButton.addEventListener('click', () => {
  textField.classList.remove('border', 'border-3', 'border-danger');
  const inputText = textField.value;
  console.log(inputText);
  try {
    schema.validateSync(inputText);
  } catch (e) {
    textField.classList.add('border', 'border-3', 'border-danger');
    console.log(e);
  }
});
