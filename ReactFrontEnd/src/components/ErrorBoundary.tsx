// import { Component } from 'react';
// import type { ErrorInfo, ReactNode } from 'react';
//
// interface Props {
//   children: ReactNode;
//   fallback?: ReactNode;
// }
//
// interface State {
//   hasError: boolean;
//   error?: Error;
// }
//
// class ErrorBoundary extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { hasError: false };
//   }
//
//   static getDerivedStateFromError(error: Error): State {
//     // Update state so the next render will show the fallback UI
//     return { hasError: true, error };
//   }
//
//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     // You can log the error to an error reporting service here
//     console.error('ErrorBoundary caught an error:', error, errorInfo);
//
//     // Redirect to error page after a short delay
//     setTimeout(() => {
//       window.location.href = '/';
//     }, 1000);
//   }
//
//   render() {
//     if (this.state.hasError) {
//       // You can render any custom fallback UI
//       if (this.props.fallback) {
//         return this.props.fallback;
//       }
//
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
//             <p className="text-gray-600">Đang chuyển hướng đến trang lỗi...</p>
//           </div>
//         </div>
//       );
//     }
//
//     return this.props.children;
//   }
// }
//
// export default ErrorBoundary;