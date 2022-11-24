import App from './App.svelte';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    document.querySelectorAll('[data-nostrOpinion]').forEach((el, i) => {
      new App({
        target: el,
        props: {
          name: el.attributes['data-nostrOpinion'].value,
        },
      });
    });
  }
});
