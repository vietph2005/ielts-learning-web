

type HighlightTextProps = {
    html: string;
};

const HighlightText = ({ html }: HighlightTextProps) => {
    return (
        <div
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default HighlightText;
