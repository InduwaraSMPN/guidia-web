interface PageHeadingProps {
  title: string
  subtitle?: string
}

export function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div className="max-w-[1216px] mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1 relative">
          <h2 className="text-2xl font-bold text-[#800020] relative inline-block">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600 max-w-3xl">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default PageHeading