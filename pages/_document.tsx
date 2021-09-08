/**
 * @format
 */

import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    const deploymentType = process.env.DEPLOYMENT_TYPE || 'local';
    const isProduction = deploymentType === 'master';

    return (
      <Html>
        <Head>
          <link rel="icon" type="image/x-icon" href="/favicon.png" />

          {isProduction && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-WSGQPRL');`
              }}
            />
          )}

          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places&&language=en`}
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />

          {isProduction && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WSGQPRL"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>`
              }}
            />
          )}
        </body>

        {isProduction && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(e,t,o,n,p,r,i){e.visitorGlobalObjectAlias=n;e[e.visitorGlobalObjectAlias]=e[e.visitorGlobalObjectAlias]||function(){(e[e.visitorGlobalObjectAlias].q=e[e.visitorGlobalObjectAlias].q||[]).push(arguments)};e[e.visitorGlobalObjectAlias].l=(new Date).getTime();r=t.createElement("script");r.src=o;r.async=true;i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)})(window,document,"https://diffuser-cdn.app-us1.com/diffuser/diffuser.js","vgo");
              vgo('setAccount', '799640821');
              vgo('setTrackByDefault', true);
              vgo('process');`
            }}
          />
        )}
      </Html>
    );
  }
}

export default MyDocument;
