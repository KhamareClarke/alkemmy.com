/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  let data = { title: 'Alkhemmy', body: '', url: '/', tag: 'default' };
  try {
    const parsed = event.data?.json();
    if (parsed && typeof parsed === 'object') {
      data = {
        title: typeof parsed.title === 'string' ? parsed.title : data.title,
        body: typeof parsed.body === 'string' ? parsed.body : '',
        url: typeof parsed.url === 'string' ? parsed.url : '/',
        tag: typeof parsed.tag === 'string' ? parsed.tag : parsed.type || data.tag,
      };
    }
  } catch {
    /* use defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag,
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});
