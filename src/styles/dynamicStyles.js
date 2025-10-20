export const getDynamicStyles = (width, height) => {
  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  return {
    topSection: {
      height: height * 0.25,
    },
    logoText: {
      fontSize: getFontSize(38),
    },
    tagline: {
      fontSize: getFontSize(16),
      marginTop: getVerticalSpacing(12),
    },
    toggleContainer: {
      marginTop: -getVerticalSpacing(20),
      padding: width * 0.012,
    },
    toggleButton: {
      padding: width * 0.03,
    },
    toggleText: {
      fontSize: getFontSize(14),
    },
    inputContainer: {
      padding: width * 0.04,
      gap: getVerticalSpacing(14),
    },
    input: {
      fontSize: getFontSize(14),
      padding: width * 0.035,
    },
    buttonText: {
      fontSize: getFontSize(14),
    },
    termsText: {
      fontSize: getFontSize(12),
      marginTop: getVerticalSpacing(18),
    },
    title: {
      fontSize: getFontSize(24),
      marginTop: getVerticalSpacing(70),
    },
    subtitle: {
      fontSize: getFontSize(14),
    },
    otpContainer: {
      marginTop: getVerticalSpacing(60),
      gap: width * 0.02,
    },
    otpInput: {
      width: width * 0.12,
      height: width * 0.12,
      fontSize: getFontSize(24),
      lineHeight: width * 0.12 - 10,
    },
    verifyButton: {
      marginTop: getVerticalSpacing(40),
      padding: width * 0.035,
    },
    verifyText: {
      fontSize: getFontSize(16),
    },
    resendText: {
      fontSize: getFontSize(14),
      marginTop: getVerticalSpacing(20),
    },
  };
}; 