import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
} as const;

export const useResponsive = () => {
    const dimensions = useWindowDimensions();
    const { width, height } = dimensions;

    return {
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
        isLargeDesktop: width >= BREAKPOINTS.desktop,
        width,
        height,
        dimensions,
    };
};
