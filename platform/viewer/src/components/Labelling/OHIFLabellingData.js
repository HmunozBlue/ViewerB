const items = [
  'Abdomen/Chest Wall',
  'Adrenal',
  'Vejiga', //Bladder
  'Hueso', //Bone
  'Cerebro', //Brain
  'pecho', //Breast
  'Colon',
  'Esofago', //Esophagus
  'Extremidades', //Extremities
  'Vesícula', //Gallbladder
  'Riñon', //Kidney
  'Hígado', //Liver
  'Pulmon', //Lung
  'Ganglio Linfatico', //Lymph Node
  'Mediastino', //Mediastinum/Hilum
  'Musculo', //Muscle
  'Cuello', //Neck
  'Ovario',
  'Pancreas',
  'Pelvis',
  'Peritoneo',
  'Prostata',
  'Retroperitoneo',
  'Intestino Delgado',//Small Bowel
  'Bazo', //Spleen
  'Stomago',
  'Subcutaneo',
];

const OHIFLabellingData = items.map(item => {
  return {
    label: item,
    value: item,
  };
});

export default OHIFLabellingData;
