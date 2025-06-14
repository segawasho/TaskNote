import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ルート変更時にスクロール位置をトップへ戻す
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [pathname]);

  return null;
}
