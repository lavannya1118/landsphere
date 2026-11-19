module.exports={
 reactStrictMode:true,
 async rewrites(){
  return [{
   source:'/__/auth/:path*',
   destination:'https://landsphere-prod-lin.firebaseapp.com/__/auth/:path*',
  }];
 },
};
