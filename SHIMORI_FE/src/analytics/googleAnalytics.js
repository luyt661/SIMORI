const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let isInitialized = false;
let lastTrackedPath = '';

function isAnalyticsAvailable() {
  return (
    typeof window !== 'undefined' &&
    Boolean(GA_MEASUREMENT_ID)
  );
}

/**
 * Khởi tạo Google Analytics 4.
 *
 * SHIMORI là React SPA nên page_view tự động được tắt.
 * Page view sẽ được AnalyticsRouteTracker gửi thủ công.
 */
export function initGoogleAnalytics() {
  if (!isAnalyticsAvailable()) {
    if (import.meta.env.DEV) {
      console.warn(
        'Không tìm thấy VITE_GA_MEASUREMENT_ID trong file .env',
      );
    }

    return;
  }

  if (isInitialized) {
    return;
  }

  isInitialized = true;

  window.dataLayer = window.dataLayer || [];

  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const scriptId = 'shimori-google-analytics';

  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');

    script.id = scriptId;
    script.async = true;
    script.src =
      `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

    document.head.appendChild(script);
  }

  window.gtag('js', new Date());

  window.gtag('config', GA_MEASUREMENT_ID, {
    // Tắt page_view mặc định để tránh bị đếm hai lần.
    send_page_view: false,

    // Khi chạy npm run dev, event sẽ hiện trong DebugView.
    debug_mode: import.meta.env.DEV,
  });
}

/**
 * Gửi page_view khi React Router đổi trang.
 *
 * Chỉ nhận pathname, không nhận query string để tránh gửi
 * design name, engraving hoặc dữ liệu người dùng lên GA4.
 */
export function trackPageView(
  pathname,
  pageTitle = document.title,
) {
  if (!isAnalyticsAvailable()) {
    return;
  }

  initGoogleAnalytics();

  if (!window.gtag) {
    return;
  }

  const safePath = pathname || '/';

  // React StrictMode chạy effect hai lần khi development.
  // Điều kiện này giúp tránh gửi hai page_view giống nhau.
  if (lastTrackedPath === safePath) {
    return;
  }

  lastTrackedPath = safePath;

  window.gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: `${window.location.origin}${safePath}`,
    page_path: safePath,
  });
}

/**
 * Hàm dùng chung để gửi các event trong những bước sau:
 * login, sign_up, design_save, add_to_cart...
 */
export function trackEvent(
  eventName,
  parameters = {},
) {
  if (!isAnalyticsAvailable()) {
    return;
  }

  initGoogleAnalytics();

  if (!window.gtag) {
    return;
  }

  window.gtag('event', eventName, parameters);
}