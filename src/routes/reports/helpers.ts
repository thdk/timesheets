export const legendCallback = (chart: any) => {
    const text = [];
    text.push('<ul class="' + chart.id + '-legend">');

    const data = chart.data;
    const datasets = data.datasets;
    const labels = data.labels;

    if (datasets.length) {
        for (let i = 0; i < datasets[0].data.length; ++i) {

            // don't show labels for items without data
            if (datasets[0].data[i]) {
                text.push('<li><span style="background-color:' + datasets[0].backgroundColor[i] + '"></span>');
                if (labels[i]) {
                    text.push(labels[i]);
                }
                text.push('</li>');
            }
        }
    }

    text.push('</ul>');
    return text.join('');
}