import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'info';
  message: string;
}

const TestingHelper = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Only show testing helper when explicitly requested with ?testing=true
  useEffect(() => {
    const showTesting = new URLSearchParams(window.location.search).get('testing') === 'true';
    setIsVisible(showTesting);
  }, []);

  const runTests = async () => {
    const results: TestResult[] = [];

    // Test 1: PWA Manifest
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      results.push({
        name: 'PWA Manifest',
        status: manifest.name ? 'pass' : 'fail',
        message: manifest.name ? 'Manifest loaded successfully' : 'Manifest missing required fields'
      });
    } catch (error) {
      results.push({
        name: 'PWA Manifest',
        status: 'fail',
        message: 'Failed to load manifest.json'
      });
    }

    // Test 2: Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        results.push({
          name: 'Service Worker',
          status: registration ? 'pass' : 'fail',
          message: registration ? 'Service worker registered' : 'Service worker not found'
        });
      } catch (error) {
        results.push({
          name: 'Service Worker',
          status: 'fail',
          message: 'Service worker registration failed'
        });
      }
    } else {
      results.push({
        name: 'Service Worker',
        status: 'fail',
        message: 'Service worker not supported'
      });
    }

    // Test 3: Deep Links
    const currentUrl = new URL(window.location.href);
    const hasDeepLinkParams = currentUrl.searchParams.has('source') || currentUrl.searchParams.has('action') || currentUrl.searchParams.has('type');
    results.push({
      name: 'Deep Link Handling',
      status: 'info',
      message: hasDeepLinkParams ? `Deep link detected: ${Array.from(currentUrl.searchParams.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}` : 'No deep link parameters in current URL'
    });

    // Test 4: Offline Support
    try {
      const cache = await caches.open('flamia-cache-v2');
      const cachedRequests = await cache.keys();
      results.push({
        name: 'Offline Support',
        status: cachedRequests.length > 0 ? 'pass' : 'info',
        message: `${cachedRequests.length} items cached for offline use`
      });
    } catch (error) {
      results.push({
        name: 'Offline Support',
        status: 'fail',
        message: 'Cache API not available'
      });
    }

    // Test 5: Network Status
    results.push({
      name: 'Network Status',
      status: navigator.onLine ? 'pass' : 'info',
      message: navigator.onLine ? 'Online' : 'Offline'
    });

    // Test 6: Display Mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = (window.navigator as any).standalone === true;
    results.push({
      name: 'PWA Install Status',
      status: isStandalone || isIOS ? 'pass' : 'info',
      message: isStandalone || isIOS ? 'Running as installed PWA' : 'Running in browser'
    });

    // Test 7: Storage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.push({
        name: 'Local Storage',
        status: 'pass',
        message: 'Local storage available'
      });
    } catch (error) {
      results.push({
        name: 'Local Storage',
        status: 'fail',
        message: 'Local storage not available'
      });
    }
    setTestResults(results);
  };

  const testDeepLinks = () => {
    const testLinks = ['/?source=pwa', '/order?source=shortcut', '/refill?action=refill', '/order?type=gas&source=protocol', '/?source=share-target&title=Test&text=Testing'];
    testLinks.forEach((link, index) => {
      setTimeout(() => {
        console.log(`Testing deep link: ${link}`);
        window.history.pushState({}, '', link);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, index * 1000);
    });
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-white border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">App Testing Helper</CardTitle>
        <CardDescription className="text-xs">
          For Google Play testing and debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={runTests} size="sm" className="text-xs">
            Run Tests
          </Button>
          <Button onClick={testDeepLinks} size="sm" variant="outline" className="text-xs">
            Test Deep Links
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                {result.status === 'pass' && <CheckCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />}
                {result.status === 'fail' && <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />}
                {result.status === 'info' && <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-muted-foreground break-words">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestingHelper;
