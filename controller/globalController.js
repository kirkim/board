import PageMaker from '../render/pageMaker.js';

export async function home(req, res) {
  const data = {
    title: `Home!`,
    contentFile: 'home.html',
  };
  const pageMaker = new PageMaker(data, req);
  pageMaker.addCss('home.css');
  return res.send(await pageMaker.render());
}
