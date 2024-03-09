import { Element } from '../types/VCard'

export enum ContentTypes {
  /** @deprecated */
  VCALENDAR = 'text/x-vcalendar',
  VCARD = 'text/x-vcard',
}

export enum Formats {
  /** @deprecated */
  VCALENDAR = 'vcalendar',
  VCARD = 'vcard',
}

export const ALLOWED_MULTIPLE_PROPERTIES: Element[] = [
  'address',
  'email',
  'phoneNumber',
  'social',
  'url',
]
export const DEFAULT_CHARACTER_SET = 'utf-8'
export const DEFAULT_CONTENT_TYPE = ContentTypes.VCARD
export const DEFAULT_EXTENSION = 'vcf'
export const DEFAULT_FILENAME = 'vcard'
export const DEFAULT_FORMAT = Formats.VCARD
export const DEFAULT_MIME_TYPE = 'JPEG'

export const MIME_TYPES = [
  'aces',
  'avci',
  'avcs',
  'avif',
  'bmp',
  'cgm',
  'dicom-rle',
  'emf',
  'example',
  'fits',
  'g3fax',
  'gif',
  'heic',
  'heic-sequence',
  'heif',
  'heif-sequence',
  'hej2k',
  'hsj2',
  'ief',
  'jls',
  'jp2',
  'jpeg',
  'jph',
  'jphc',
  'jpm',
  'jpx',
  'jxr',
  'jxrA',
  'jxrS',
  'jxs',
  'jxsc',
  'jxsi',
  'jxss',
  'ktx',
  'ktx2',
  'naplps',
  'png',
  'prs.btif',
  'prs.pti',
  'pwg-raster',
  'svg+xml',
  't38',
  'tiff',
  'tiff-fx',
  'vnd.adobe.photoshop',
  'vnd.airzip.accelerator.azv',
  'vnd.cns.inf2',
  'vnd.dece.graphic',
  'vnd.djvu',
  'vnd.dwg',
  'vnd.dxf',
  'vnd.dvb.subtitle',
  'vnd.fastbidsheet',
  'vnd.fpx',
  'vnd.fst',
  'vnd.fujixerox.edmics-mmr',
  'vnd.fujixerox.edmics-rlc',
  'vnd.globalgraphics.pgb',
  'vnd.microsoft.icon',
  'vnd.mix',
  'vnd.ms-modi',
  'vnd.mozilla.apng',
  'vnd.net-fpx',
  'vnd.pco.b16',
  'vnd.radiance',
  'vnd.sealed.png',
  'vnd.sealedmedia.softseal.gif',
  'vnd.sealedmedia.softseal.jpg',
  'vnd.svf',
  'vnd.tencent.tap',
  'vnd.valve.source.texture',
  'vnd.wap.wbmp',
  'vnd.xiff',
  'vnd.zbrush.pcx',
  'wmf',
  'x-emf',
  'x-wmf',
]
