import PageMaker from './pageMaker.js';
import * as userDb from '../db/userData.js';
import * as postDb from '../db/postData.js';

export default class PostPageMaker extends PageMaker {
  constructor(data, req) {
    super(data, req);
    this.posts = data.posts;
    this.postId = data.no ? data.no : undefined;
    this.pageRange = Number(data.pageRange);
    this.type = data.type ? data.type : 'board';
    this.pagebarRange = 10;
    this.page = {
      currentNum: data.num ? data.num : 1,
      maxNum: Math.ceil(data.posts.length / this.pageRange),
    };
  }

  formatList = async (post, nb) => {
    const title = `<div class="${this.type}__title"><a href="/posts/view?no=${post.id}&page=${this.page.currentNum}&range=${this.pageRange}">${post.title}</a></div>`;
    let user = await userDb.findById(post.userId);
    if (!user) {
      user = {
        name: 'none',
        id: '', // 삭제된 유저 아이디 루트 넣기
      };
    }
    const num = `<div class="${this.type}__num">${nb}</div>`;
    const auth = `<div class="${this.type}__auth"><a href="/users/${user.id}">${user.name}</a></div>`;
    const date = `
		<div class="${this.type}__date">
			${post.createdAt.toLocaleString()}
		</div>`;
    const view = `<div class="${this.type}__set">${num}${title}${auth}${date}</div>`;
    return view;
  };

  makePagebar = () => {
    let data = '';
    let firstPage = '';
    let lastPage = '';
    const tool = (this.page.currentNum - 1) % this.pagebarRange;
    let x = this.page.currentNum - tool;
    if (x > this.pagebarRange) {
      firstPage = `
			<a href="/posts/list?page=1&range=${this.pageRange}">[1]</a> ...
			<a href="/posts/list?page=${x - 1}&range=${this.pageRange}">◀︎ </a>`;
    }
    if (this.page.maxNum >= x + this.pagebarRange) {
      lastPage = `...<a href="/posts/list?page=${this.page.maxNum}&range=${this.pageRange}">[${this.page.maxNum}]</a>`;
    }

    for (let i = x; i <= x + this.pagebarRange; i++) {
      if (i > this.page.maxNum) {
        break;
      } else if (i >= x + this.pagebarRange) {
        data =
          data +
          `<a href="/posts/list?page=${i}&range=${this.pageRange}"> ▶︎</a>`;
        break;
      }

      if (i === parseInt(this.page.currentNum)) {
        data =
          data +
          `<a href="/posts/list?page=${i}&range=${this.pageRange}"><b style="font-size:20px">[${i}]</b></a>`;
      } else {
        data =
          data +
          `<a href="/posts/list?page=${i}&range=${this.pageRange}">[${i}]</a>`;
      }
    }

    return firstPage + data + lastPage;
  };

  makeBoardNav = () => {
    const MAX = 30;
    const INTERVAL = 5;
    let data = '';
    let optionTag = '';
    let option = '';

    for (let i = 5; i <= MAX; i += INTERVAL) {
      if (i === this.pageRange) {
        option = 'selected';
      } else {
        option = '';
      }
      optionTag = optionTag + `<option ${option} value=${i}>${i} 개</option>`;
    }

    data = `
		<div class="post__range">
			<form method="GET")>
				<select onchange="this.form.submit()" name="range">
					${optionTag}
				</select>
			</form>
		</div>
		<div class="uploadBtn">
			<a href="/posts/upload">글쓰기</a>
		</div>`;

    return data;
  };

  makePost = async () => {
    const post = await postDb.findById(this.postId);
    const user = await userDb.findById(post.userId);

    /* root관리자에게 위임을 여기서할지 고민..*/
    let updateBtn = '';
    let deleteBtn = '';
    if (user.id === this.req.session.user.id) {
      updateBtn = `<a class="post__update" href="/posts/update?no=${this.postId}&page=${this.page.maxNum}&range=${this.pageRange}">수정하기</a>`;
      deleteBtn = `<span class="post__delete" id="deleteBtn">삭제하기</span>`;
    }
    const content = `
  	<div class="post__set">
  		<div class="post__title">${post.title}</div>
  		<div class="post__info">
  			<div class="post__auth">
  				<a href="/users/${user.id}">${user.name}</a> |
  			</div>
  			<div class="post__date">${post.createdAt.toLocaleString()}</div>
  			${updateBtn}
  			${deleteBtn}
  		</div>
  		<div class="post__content">${post.content}</div>
  	</div>`;

    return content;
  };
  //@OverRide
  setContent = async () => {
    let data = '';
    const base = `
		<div class="${this.type}__main__set">
		<div class="${this.type}__main__num">Num</div>
			<div class="${this.type}__main__title">제목</div>
			<div class="${this.type}__main__auth">글쓴이</div>
			<div class="${this.type}__main__date">작성일</div>
		</div>`;

    let i = 0;
    const range = this.page.currentNum * this.pageRange;
    for (let post of this.posts) {
      i++;
      if (i <= range - this.pageRange) {
        continue;
      }
      if (i > range) {
        break;
      }
      const view = await this.formatList(post, i);
      data = data + view;
    }
    const boardNav = `<div class="${
      this.type
    }__nav">${this.makeBoardNav()}</div>`;
    const pagebar = `<div class="${
      this.type
    }__pagebar">${this.makePagebar()}</div>`;

    const list = `<div class="${this.type}">${base}${data}${boardNav}${pagebar}</div>`;
    let view = '';
    if (this.postId) {
      view = await this.makePost();
    }
    return view + list;
  };
}
