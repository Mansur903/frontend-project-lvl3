import {
  modalTitle, modalDescription, readAllButton, watchedState, state,
} from '../view.js';

function preview(previewButton) {
  previewButton.forEach((item) => {
    item.addEventListener('click', () => {
      readAllButton.setAttribute('href', `${item.closest('.list-group-item').firstChild.href}`);
      modalTitle.textContent = item.closest('.list-group-item').firstChild.textContent;
      const { id } = item;
      watchedState.posts[id - 1].status = 'read';
      const description = state.posts.filter((post) => post.id === Number(id))[0]
        .data
        .querySelector('description')
        .textContent;
      modalDescription.textContent = description;
      document.getElementById(item.id).firstChild.classList.remove('fw-bold');
      document.getElementById(item.id).firstChild.classList.add('fw-normal');
    });
  });
}

export default preview;
