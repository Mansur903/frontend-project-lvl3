function parse(stringContainingXMLSource) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringContainingXMLSource, 'application/xml');
  if (doc.querySelector('parsererror') !== null) {
    const error = new Error('RSS not found'); // возврат ошибки (выкинуть её, передать тип ошибки)
    error.type = 'empty-doc';
    throw error;
  } else {
    const channel = doc.querySelector('channel');
    const posts = Array.from(doc.querySelectorAll('item'));
    const result = {
      title: channel.querySelector('title'),
      description: channel.querySelector('description'),
      posts: posts.map((item) => {
        const obj = {
          item,
          pubDate: item.querySelector('pubDate').textContent,
        };
        return obj;
      }),
    };
    return result;
  }
}

export default parse;
