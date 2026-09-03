export type HeroLayoutVariant = "full" | "archFrame";

export const heroLayoutRegistry: Record<HeroLayoutVariant, { label: string }> = {
  full: { label: "Ảnh bìa toàn màn hình" },
  archFrame: { label: "Khung vòm & chim én" },
};

// public/frame.svg is two nested arches in the SAME 0 0 754 1099 space: a
// larger outer boundary (its first path) and a visibly SMALLER inner arch
// inset well inside it (its second path, filled peach in the source file).
// Used separately rather than as one shape: the OUTER path is traced here
// as the decorative frame line, while the cover photo is masked to the
// smaller INNER path — so the photo sits *inside* the frame with the
// page's own background showing in the gap between them, matching a real
// printed invitation's mounted-photo look, instead of the photo filling
// the entire silhouette edge-to-edge with the line just touching its crop.
export const ARCH_FRAME_OUTER_PATH =
  "M325,1100C216.666672,1100,108.833344,1100,1.000015,1100C1.00001,733.666687,1.00001,367.333405,1.000005,1.000064C252.333298,1.000042,503.666595,1.000042,754.999878,1.000021C754.999939,367.333252,754.999939,733.666504,755,1099.999878C611.833313,1100,468.666656,1100,325,1100Z";

export const ARCH_FRAME_INNER_PATH =
  "M228,1055C215.00177,1055,202.501923,1055.129272,190.0056,1054.974731C158.40918,1054.583862,130.729935,1031.288452,124.943321,1000.573669C124.79171,999.768982,124.364571,999.017822,124.195847,998.214355C123.503479,994.917297,123.922714,990.402527,121.91188,988.634521C119.765358,986.747192,115.339554,987.464539,111.911987,987.019836C99.384811,985.394531,88.755753,979.825134,79.17907,971.747253C66.483101,961.038269,59.490475,947.165955,56.284508,931.223022C55.313938,926.396545,55.051048,921.35791,55.049885,916.416321C54.992916,673.783936,54.893566,431.151428,55.155666,188.519318C55.183552,162.705627,67.002319,142.437195,89.629593,129.241074C94.420738,126.446892,99.699821,124.27623,105.007561,122.641037C110.302795,121.009697,115.916306,120.411446,120.073723,119.613091C123.518013,108.648453,125.446724,97.513977,130.359421,87.905121C140.70752,67.665077,157.946594,55.903252,180.738739,53.047878C186.798218,52.288757,192.957504,52.044792,199.071198,52.04184C316.221313,51.985245,433.372162,51.783436,550.520935,52.17807C574.689636,52.259487,593.380676,63.997578,606.24231,84.597961C612.672852,94.897682,615.743286,106.245827,616.262573,118.259453C621.924011,119.144653,627.506226,119.623573,632.889343,120.925674C659.694763,127.409492,679.280823,149.073288,683,176.162918C683.560242,180.243607,683.959045,184.385056,683.959778,188.498474C684.004761,432.797302,684.045166,677.09613,683.923645,921.394897C683.912598,943.59198,673.843384,961.110107,655.945312,973.945068C643.772522,982.674377,635.536987,985.235168,618.14502,987.324341C616.769043,994.353333,616.120728,1001.475342,613.946655,1008.096313C605.609497,1033.486206,587.420288,1048.091919,561.769775,1053.818237C557.29895,1054.816284,552.565247,1054.951172,547.952637,1054.953735C441.468414,1055.013672,334.984222,1055,228,1055Z";

// The two paths above combined into one compound path — filled with
// `fillRule="evenodd"`, the two overlapping contours don't add together
// into one solid arch; they cancel where they overlap, leaving only the
// donut-shaped ring *between* them filled. That ring, painted solid gold,
// is the actual "khung" (frame) with real visible width — a plain stroked
// outline read as a thin, flat hairline next to the reference's chunky
// gilded border, since a `stroke` only straddles the path's own edge
// rather than filling the whole gap between the two shapes.
export const ARCH_FRAME_RING_PATH = `${ARCH_FRAME_OUTER_PATH} ${ARCH_FRAME_INNER_PATH}`;

/** A `mask-image` data URI containing only ARCH_FRAME_INNER_PATH — built
 * from the raw path data (not by pointing at public/frame.svg) so the
 * mask can never accidentally pick up the outer shape too. Same string
 * every call (no randomness), so it's safe to compute inline in a
 * component body. */
export function archFrameInnerMask() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 754 1099'><path d='${ARCH_FRAME_INNER_PATH}' fill='#fff'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
