const deleteBtn = document.querySelector('#deleteBtn');

const handleDeleteBtn = async (event) => {
  const sch = location.search;
  const querys = new URLSearchParams(sch);
  const noParam = querys.get('no');
  const pageParam = querys.get('page');
  const rangeParam = querys.get('range');
  let response;
  try {
    response = await fetch(`/posts/view?no=${noParam}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(error);
  }

  if (response.status === 200) {
    window.location.reload();
    window.location.href = `/posts/list?page=${pageParam}&range=${rangeParam}`;
  }
};

deleteBtn.addEventListener('click', handleDeleteBtn);
