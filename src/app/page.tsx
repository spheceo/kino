import Image from "next/image";
import Link from "next/link";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { WatchNow } from "@/components/watch-now";
import { env } from "@/lib/env";
import { getRecommended } from "@/lib/get-recommended";

export const dynamic = "force-dynamic";

export default async function Home() {
  // const index = Math.floor(Math.random() * 10)
  const index = 2;

  const data = await getRecommended(index);

  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/week?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data2 = await res.json();
  const films = data2.results;
  // console.log("FILMS: ", films);

  // console.log(data.nextEpisode, typeof data.nextEpisode);

  return (
    <div className="min-h-dvh bg-background text-white">
      {/* Recommended Section */}
      <div className="relative h-[85dvh]">
        <div className="relative h-full w-full">
          <Image
            alt="Banner"
            width="1920"
            height="1080"
            className="absolute inset-0 h-full w-full object-cover"
            src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-[#14141499] to-[#14141433]" />
          <div className="relative z-10 flex h-full w-full flex-col justify-end p-10">
            <div className="relative w-[600px] space-y-5">
              {data.title.includes(":") ? (
                (() => {
                  const [main, sub] = data.title.split(":");
                  return (
                    <div className="font-bold flex-col">
                      <h3 className="text-3xl">{main} :</h3>
                      <h1 className="text-8xl">{sub.trim()}</h1>
                    </div>
                  );
                })()
              ) : (
                <h1 className="text-8xl font-bold">{data.title}</h1>
              )}
              <div className="flex gap-2 items-center">
                <h1 className="text-xl font-semibold">{data.ranking}</h1>
                <p>•</p>
                {data.nextEpisode !== "false" &&
                data.nextEpisode !== "undefined" ? (
                  <h1 className="text-xl font-semibold">
                    New Episode {data.nextEpisode}
                  </h1>
                ) : (
                  <>
                    <p>{data.year}</p>
                    <p>•</p>
                    <p>{data.duration}</p>
                  </>
                )}
              </div>
              <p>{data.description}</p>
              <div className="flex items-center gap-4">
                <WatchNow id={data.id} />

                <Link
                  href={`/info/${data.id}`}
                  className="bg-[#2c2c2c] w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <IoMdInformationCircleOutline size={25} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-10 space-y-5 relative">
        <h1 className="text-3xl font-bold">Trending</h1>
        <div className="flex gap-3 relative flex-wrap md:flex-nowrap">
          {Array.isArray(films) &&
            films.slice(0, 9).map((film) => (
              <Link
                href={`/info/${film.id}`}
                key={film.id}
                className="cursor-pointer md:h-[15vw] relative group transition-all duration-300 hover:-translate-y-5"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/original${film?.poster_path}`}
                  alt="posters"
                  width={300}
                  height={450}
                  className="rounded-lg w-[25vw] md:w-[11vw] h-full object-cover border border-[#090909]"
                />
                <div className="opacity-0 transition-all duration-500 group-hover:opacity-100 absolute z-10 top-0 h-full w-full flex flex-col justify-between p-2 bg-gradient-to-t from-black to-transparent">
                  <div className="flex justify-end w-full">
                    {/* <WatchLater
                                    text={false}
                                    size={20}
                                    className='px-1 py-1 border-white bg-blur-light text-black'
                                    id={film?.id}
                                    type={film.media_type as string}
                                    date={film?.first_air_date ? film?.first_air_date.slice(0, -6) : film?.release_date.slice(0, -6) || '0000'}
                                    name={film?.title ? film?.title : film?.name}
                                    poster={`https://image.tmdb.org/t/p/original${film?.poster_path}`}
                                /> */}
                  </div>
                  {film && (
                    <div>
                      <h1 className="font-medium">
                        {film.title ? film.title : film.name}
                      </h1>
                      <p className="text-[#7e7e7e] font-semibold">
                        {film?.first_air_date
                          ? film?.first_air_date.slice(0, -6)
                          : film?.release_date
                            ? film.release_date.slice(0, -6)
                            : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
