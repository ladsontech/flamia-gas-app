
import * as React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const DeepLinkHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const handleDeepLink = () => {
      const source = searchParams.get('source');
      const type = searchParams.get('type');
      const action = searchParams.get('action');
      
      console.log('Deep link detected:', { 
        pathname: location.pathname, 
        source, 
        type, 
        action,
        searchParams: Object.fromEntries(searchParams.entries())
      });

      // Handle PWA launches
      if (source === 'pwa') {
        console.log('App launched from PWA');
        // App launched from home screen, stay on current page
        return;
      }

      // Handle shortcut launches
      if (source === 'shortcut') {
        console.log('App launched from shortcut');
        toast.success('Welcome back to Flamia!');
        return;
      }

      // Handle share target
      if (source === 'share-target') {
        const title = searchParams.get('title');
        const text = searchParams.get('text');
        const url = searchParams.get('url');
        
        console.log('Share target activated:', { title, text, url });
        
        if (title || text || url) {
          // Navigate to order page with shared content
          navigate('/order?shared=true', { 
            state: { sharedData: { title, text, url } }
          });
          toast.success('Content shared to Flamia!');
        }
        return;
      }

      // Handle protocol handlers (web+flamia://)
      if (type && location.pathname === '/order') {
        console.log('Protocol handler activated for type:', type);
        toast.info(`Opening ${type} order`);
        return;
      }

      // Handle file handlers
      const fileId = searchParams.get('fileId');
      if (fileId && location.pathname === '/order') {
        console.log('File handler activated for fileId:', fileId);
        toast.info('Processing uploaded file');
        return;
      }

      // Handle general navigation actions
      if (action) {
        switch (action) {
          case 'order':
            navigate('/order');
            break;
          case 'refill':
            navigate('/refill');
            break;
          case 'accessories':
            navigate('/accessories');
            break;
          case 'safety':
            navigate('/safety');
            break;
          default:
            console.log('Unknown action:', action);
        }
      }
    };

    // Run the handler
    handleDeepLink();

    // Also listen for popstate events (browser navigation)
    const handlePopState = () => {
      console.log('Browser navigation detected');
      handleDeepLink();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, searchParams, navigate]);

  // Handle external link clicks within the app
  React.useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // If it's an internal link, prevent default and use React Router
        if (url.origin === currentUrl.origin) {
          event.preventDefault();
          const path = url.pathname + url.search + url.hash;
          navigate(path);
          console.log('Internal navigation to:', path);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [navigate]);

  return null;
};

export default DeepLinkHandler;
