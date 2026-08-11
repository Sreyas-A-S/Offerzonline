(function () {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const placement = currentScript.getAttribute('data-placement') || 'responsive';
  const serverUrl = currentScript.src.replace('/ad.js', '');

  const iframe = document.createElement('iframe');
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.scrolling = 'no';

  // Format sizing
  if (placement === '300x250') {
    iframe.style.width = '300px';
    iframe.style.height = '250px';
  } else if (placement === '728x90') {
    iframe.style.width = '728px';
    iframe.style.height = '90px';
  } else {
    iframe.style.width = '100%';
    iframe.style.height = '250px';
  }

  // Fetch geotargeted ad via iframe
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      iframe.src = `${serverUrl}/embed/frame?lat=${latitude}&lng=${longitude}&format=${placement}`;
    },
    () => {
      iframe.src = `${serverUrl}/embed/frame?format=${placement}`;
    }
  );

  currentScript.parentNode.insertBefore(iframe, currentScript);
})();
