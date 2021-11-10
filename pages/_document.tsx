import Document, {
    Html,
    Head,
    Main,
    NextScript,
    DocumentContext,
} from 'next/document';

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return {...initialProps};
    }

    render() {
        return (
            <Html data-theme="dark" className="bg-base-200">
                <Head />
                <body>
                    <Main />
                    <div id="portal-root" />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
