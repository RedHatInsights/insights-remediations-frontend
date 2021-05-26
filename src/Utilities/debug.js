const debug = localStorage.getItem('remediations:debug') === 'true';

export const pagination = debug
  ? {
      perPageOptions: [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 100, 200].map(
        (i) => ({ title: `${i}`, value: i })
      ),
    }
  : {};
