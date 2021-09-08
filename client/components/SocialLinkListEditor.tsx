import classnames from 'classnames';

import styles from './SocialLinkListEditor.module.scss';

interface Props {
  value : string[];
  onChange : (value : string[]) => void;
};

export const getBrandNameFromLink = (link : string) => {
  const domainParts = link.toLowerCase().replace(/https?:\/\//, '').split('/')[0].split('.');
  const brandName = domainParts.length > 1 ? domainParts[domainParts.length - 2] : '';
  const brandNames = [
    'instagram', 'twitter', 'behance', 'facebook', 'dribbble', 'github', 'medium', 'linkedin'
  ];
  if(brandNames.includes(brandName))
    return brandName;
  return 'generic';
};

export const getCompanyFromLink = (link : string) => {
  const brand = getBrandNameFromLink(link);
  if(brand !== 'generic')
    return brand.length > 0 ? (brand[0].toUpperCase() + brand.slice(1)) : '';
  const urlParts = link.toLowerCase().replace(/https?:\/\//, '').split('/');
  return urlParts[0];
};

const SocialLinkListEditor = ({ value, onChange } : Props) => {
  return (
    <div className={classnames("input-group", styles.socialLinkListEditor)}>
      <button 
        className={classnames("btn-small", styles.addBtn)}
        onClick={evt => onChange( [ ...value, '' ] )}
      >
        + Add new field
      </button>
      {value?.map((l, i) => 
        <div key={i} className={classnames("input-group", styles.item)}>
          <img 
            className={classnames("brand-icon", styles.brandIcon)} 
            src={`/icons/brands/${getBrandNameFromLink(l)}.svg`}
          />
          <input
            type='text' 
            value={value[i]}
            onChange={evt => {
              const newValue = value.slice();
              newValue[i] = evt.target.value.replace(/https?:\/\//, '');
              onChange(newValue);
            }}
            placeholder="linkedin.com/yourprofile"
          />
          <img 
            className={classnames("icon", styles.remove)}
            src="/icons/trash.svg"
            onClick={evt => {
              const onValue = value.slice();
              onValue.splice(i, 1);
              onChange(onValue);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SocialLinkListEditor;
