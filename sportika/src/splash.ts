import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import './styles/splash.css';

// Пока второй стиль не выложен рядом (./2/), карточка показывает «скоро» и не ведёт в 404.
const two = document.querySelector<HTMLAnchorElement>('.style-card--two');
if (two) {
  fetch(two.href, { method: 'HEAD' })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
    })
    .catch(() => {
      two.classList.add('is-soon');
      two.removeAttribute('href');
      const cta = two.querySelector('.style-card__cta');
      if (cta) cta.textContent = 'Скоро';
    });
}
