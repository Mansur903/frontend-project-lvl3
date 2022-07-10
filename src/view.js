import onChange from 'on-change';
import _ from 'lodash';

const initWatchedState = (i18nextInstance, state, domElements) => onChange(state, (path, value) => {
  const handleAddPosts = () => {
    const { posts } = state;
    domElements.listGroupUlPosts.innerHTML = '';
    posts.forEach(({ postTitle, link, id }) => {
      const listGroupItemLi = document.createElement('li');
      const aElem = document.createElement('a');
      const itemButton = document.createElement('button');
      listGroupItemLi.classList.add('list-group-item', 'd-flex',
        'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      listGroupItemLi.setAttribute('id', `${id}`);
      if (state.watchedPosts.has(id)) {
        aElem.classList.add('fw-normal');
      } else {
        aElem.classList.add('fw-bold');
      }
      itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview');
      itemButton.setAttribute('data-id', `${id}`);
      itemButton.setAttribute('type', 'button');
      itemButton.setAttribute('data-bs-toggle', 'modal');
      itemButton.setAttribute('data-bs-target', '#rssModal');
      aElem.setAttribute('href', link);
      itemButton.textContent = i18nextInstance.t('posts.postButton');
      aElem.textContent = postTitle;
      listGroupItemLi.append(aElem);
      listGroupItemLi.append(itemButton);
      domElements.listGroupUlPosts.append(listGroupItemLi);
    });
  };

  const handleCreateFeedsHeader = () => {
    if (state.feeds.length === 1) {
      const cardBodyDivFeeds = document.querySelector('.card-body-feeds');
      const cardTitleHeaderFeeds = document.createElement('h2');
      cardBodyDivFeeds.append(cardTitleHeaderFeeds);
      cardTitleHeaderFeeds.classList.add('card-title', 'h4', 'ms-3');
      cardTitleHeaderFeeds.textContent = i18nextInstance.t('feeds.feedsHeader');
    }
  };

  const handleCreatePostsHeader = () => {
    if (state.feeds.length === 1) {
      const cardBodyDivPosts = document.querySelector('.card-body-posts');
      const cardTitleHeaderPosts = document.createElement('h2');
      cardBodyDivPosts.append(cardTitleHeaderPosts);
      cardTitleHeaderPosts.classList.add('card-title', 'h4', 'ms-3');
      cardTitleHeaderPosts.textContent = i18nextInstance.t('posts.postsHeader');
    }
  };

  const handleAddFeed = () => {
    handleCreatePostsHeader();
    handleCreateFeedsHeader();
    const lastFeed = state.feeds[state.feeds.length - 1];
    const listGroupItemLi = document.createElement('li');
    const titleH3 = document.createElement('h3');
    const feedDescription = document.createElement('p');
    titleH3.textContent = lastFeed.title.textContent;
    feedDescription.textContent = lastFeed.description.textContent;
    titleH3.classList.add('h6', 'm-0');
    feedDescription.classList.add('m-0', 'text-black-50');
    listGroupItemLi.classList.add('list-group-item', 'border-0', 'border-end-0');
    listGroupItemLi.append(titleH3);
    listGroupItemLi.append(feedDescription);
    domElements.listGroupUlFeeds.append(listGroupItemLi);
  };

  const handleModal = () => {
    const openedPost = document.getElementById(`${state.modal.postId}`);
    domElements.readAllButton.setAttribute('href', `${openedPost.firstChild.href}`);
    domElements.modalTitle.textContent = openedPost.firstChild.textContent;
    domElements.modalDescription.textContent = state
      .posts[_.findIndex(state.posts, (post) => post.id === state.modal.postId)]
      .postDescription;
    openedPost.firstChild.classList.remove('fw-bold');
    openedPost.firstChild.classList.add('fw-normal');
  };

  const handleForm = () => {
    switch (value.state) {
      case 'idle':
        domElements.textField.classList.remove('border', 'border-2', 'border-danger');
        domElements.feedback.textContent = '';
        domElements.textField.removeAttribute('readonly');
        domElements.submittingButton.disabled = false;
        break;
      case 'submitting':
        domElements.textField.setAttribute('readonly', true);
        domElements.submittingButton.disabled = true;
        domElements.textField.classList.remove('border', 'border-2', 'border-danger');
        domElements.feedback.textContent = '';
        break;
      case 'success':
        domElements.textField.removeAttribute('readonly');
        domElements.submittingButton.disabled = false;
        domElements.textField.classList.remove('border', 'border-2', 'border-danger');
        domElements.textField.value = '';
        domElements.feedback.classList.remove('text-danger');
        domElements.feedback.classList.add('text-success');
        domElements.feedback.textContent = i18nextInstance.t('feedback.success');
        break;
      case 'error':
        domElements.textField.removeAttribute('readonly');
        domElements.submittingButton.disabled = false;
        domElements.feedback.classList.remove('text-success');
        domElements.feedback.classList.add('text-danger');
        domElements.textField.classList.add('border', 'border-3', 'border-danger');
        domElements.feedback.textContent = i18nextInstance.t(`feedback.${value.errorType}`);
        break;
      default:
    }
  };

  switch (path) {
    case 'form':
      handleForm();
      break;
    case 'feeds': {
      handleAddFeed();
      break;
    }
    case 'posts': {
      handleAddPosts();
      break;
    }
    case 'modal.postId':
      handleModal();
      break;
    default:
  }
});

export default initWatchedState;
