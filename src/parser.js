function parse(stringContainingXMLSource) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  if (doc.querySelector('parsererror') !== null) {
    const error = new Error('RSS not found');
    error.type = 'noRss';
    throw error;
  } else {
    const channel = doc.querySelector('channel');
    const posts = Array.from(doc.querySelectorAll('item'));
    const result = {
      title: channel.querySelector('title'),
      description: channel.querySelector('description'),
      posts: posts.map((item) => (
        {
          postTitle: item.querySelector('title').textContent,
          postDescription: item.querySelector('description').textContent,
          pubDate: item.querySelector('pubDate').textContent,
          modalLink: item.querySelector('link').textContent,
        }
      )),
    };
    return result;
  }
}

export default parse;
