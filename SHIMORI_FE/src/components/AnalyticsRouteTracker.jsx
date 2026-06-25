import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackPageView } from '../analytics/googleAnalytics';

function getSafeAnalyticsPath(pathname) {
  /*
   * Gom tất cả trang chi tiết sản phẩm về một route chung.
   *
   * Ví dụ:
   * /product-detail/12
   * /product-detail/35
   *
   * đều được báo cáo thành:
   * /product-detail/:id
   */
  if (pathname.startsWith('/product-detail/')) {
    return '/product-detail/:id';
  }

  return pathname || '/';
}

function getPageTitle(pathname) {
  if (pathname.startsWith('/product-detail/')) {
    return 'Product Detail | SHIMORI';
  }

  switch (pathname) {
    case '/':
    case '/home':
      return 'Home | SHIMORI';

    case '/login':
      return 'Login | SHIMORI';

    case '/signup':
      return 'Sign Up | SHIMORI';

    case '/design':
      return 'Design Studio | SHIMORI';

    case '/my-designs':
      return 'My Designs | SHIMORI';

    case '/account':
      return 'Account | SHIMORI';

    default:
      return 'SHIMORI';
  }
}

function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const safePath = getSafeAnalyticsPath(
      location.pathname,
    );

    const pageTitle = getPageTitle(
      location.pathname,
    );

    document.title = pageTitle;

    trackPageView(safePath, pageTitle);
  }, [location.pathname]);

  return null;
}

export default AnalyticsRouteTracker;