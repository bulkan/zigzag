const marshall = (miraConfig = {}) => {
  return btoa(JSON.stringify(miraConfig));
};

const unmarshall = s => {
  try {
    return JSON.parse(atob(s));
  } catch(e) {
    return null;
  }
};

const updateUrl = s => {
  window.history.pushState(null, '', `?s=${s}`); 
};

const getConfigFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return unmarshall(urlParams.get('s'));
}

module.exports = { marshall, unmarshall};