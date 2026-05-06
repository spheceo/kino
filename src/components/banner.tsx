const showBanner = false;

export default function Banner() {
  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-[#1d1d1d] text-white w-full h-12 flex items-center justify-center motion-preset-slide-down delay-1000 relative z-10">
      <p className="text-sm font-medium">
        SOME TITLES MAY BE UNAVAILABLE TEMPORARILY
      </p>
    </div>
  );
}
