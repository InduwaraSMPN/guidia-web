import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function ComingSoonScroll() {
  return (
    <div className="flex flex-col overflow-hidden pb-[132px] pt-[132px]">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-2xl md:text-2xl font-semibold text-black dark:text-white">
            coming soon to <br />
              <span className="text-[#800020] text-5xl md:text-[6rem] font-bold mt-1 leading-none">
              <span className="font-grillmaster">Guidia</span>

              </span>
            </h1>
          </>
        }
      >
        <div className="rounded-2xl overflow-hidden h-full relative">
          <img
            src="images/coming-soon-image.png"
            alt="Scroll Animation Demo"
            className="mx-auto rounded-2xl object-cover h-full w-full"
            draggable={false}
          />
          <div className="absolute top-4 left-4">
            <img src="/images/small-logo-light.svg" alt="Logo" className="h-6" />
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
