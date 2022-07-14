import onChange from 'on-change';
import _ from 'lodash';

const initWatchedState = (i18nextInstance, state, domElements) => onChange(state, (path, value) => {
  const handleAddPosts = () => {
    const { postsBlock } = domElements;
    const postsCard = postsBlock.querySelector('.card');

    const postsTitleWrapper = document.createElement('div');
    postsTitleWrapper.classList.add('card-posts-title-wrapper');

    const cardTitleHeaderPosts = document.createElement('h2');
    cardTitleHeaderPosts.classList.add('card-title', 'h4', 'ms-3');
    cardTitleHeaderPosts.textContent = i18nextInstance.t('posts.postsHeader');

    postsTitleWrapper.append(cardTitleHeaderPosts);

    const newPostCard = document.createElement('div');
    newPostCard.classList.add('card', 'border-0');

    const { posts } = state;

    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0', 'ul-posts');

    posts.forEach(({ postTitle, link, id }) => {
      const listGroupItem = document.createElement('li');
      const linkElem = document.createElement('a');
      const itemButton = document.createElement('button');
      listGroupItem.classList.add(
        'list-group-item', 'd-flex',
        'justify-content-between', 'align-items-start', 'border-0', 'border-end-0',
      );
      listGroupItem.setAttribute('id', id);
      if (state.watchedPosts.has(id)) {
        linkElem.classList.add('fw-normal');
      } else {
        linkElem.classList.add('fw-bold');
      }
      itemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'preview');
      itemButton.setAttribute('data-id', id);
      itemButton.setAttribute('type', 'button');
      itemButton.setAttribute('data-bs-toggle', 'modal');
      itemButton.setAttribute('data-bs-target', '#rssModal');
      linkElem.setAttribute('href', link);
      itemButton.textContent = i18nextInstance.t('posts.postButton');
      linkElem.textContent = postTitle;
      listGroupItem.append(linkElem);
      listGroupItem.append(itemButton);
      listGroup.append(listGroupItem);
    });
    newPostCard.append(postsTitleWrapper);
    newPostCard.append(listGroup);
    postsCard.replaceWith(newPostCard);
  };

  const handleAddFeed = () => {
    const { feedsBlock } = domElements;
    const feedsCard = feedsBlock.querySelector('.card');

    const feedsTitleWrapper = document.createElement('div');
    feedsTitleWrapper.classList.add('card-feeds-title-wrapper');

    const cardTitleHeaderFeeds = document.createElement('h2');
    cardTitleHeaderFeeds.classList.add('card-title', 'h4', 'ms-3');
    cardTitleHeaderFeeds.textContent = i18nextInstance.t('feeds.feedsHeader');
    feedsTitleWrapper.append(cardTitleHeaderFeeds);
    const feedsList = state.feeds;
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0', 'ul-feeds');

    feedsList.forEach((feed) => {
      const listGroupItem = document.createElement('li');
      const title = document.createElement('h3');
      const feedDescription = document.createElement('p');
      title.textContent = feed.title;
      feedDescription.textContent = feed.description;
      title.classList.add('h6', 'm-0');
      feedDescription.classList.add('m-0', 'text-black-50');
      listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      listGroupItem.append(title);
      listGroupItem.append(feedDescription);
      listGroup.append(listGroupItem);
    });

    const newFeedCard = document.createElement('div');
    newFeedCard.classList.add('card', 'border-0');
    newFeedCard.append(feedsTitleWrapper);
    newFeedCard.append(listGroup);
    feedsCard.replaceWith(newFeedCard);
  };

  const handleModal = () => {
    const postModal = document.getElementById(state.modal.postId);
    const postLinkElement = postModal.firstChild;
    domElements.readAllButton.setAttribute('href', postLinkElement.href);
    domElements.modalTitle.textContent = postLinkElement.textContent;
    const postsList = state.posts;
    const { postDescription } = _.find(postsList, (post) => post.id === state.modal.postId);
    domElements.modalDescription.textContent = postDescription;
  };

  const handleWatchPost = () => {
    const post = document.getElementById(state.modal.postId);
    post.firstChild.classList.remove('fw-bold');
    post.firstChild.classList.add('fw-normal');
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
    case 'watchedPosts':
      handleWatchPost();
      break;
    default:
  }
});

export default initWatchedState;
