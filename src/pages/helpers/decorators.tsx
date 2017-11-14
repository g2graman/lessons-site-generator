import IMetadata from "./IPageMetadata";

export default {
    setPageMetadata: (options: IMetadata) => {
        return (targetClass: any) => {
            const decoratedTargetClass = Object.assign({}, targetClass);

            Object.keys(options).forEach((optionKey: string) => {
                decoratedTargetClass[optionKey] = options[optionKey];
            });

            return decoratedTargetClass;
        };
    },
};
