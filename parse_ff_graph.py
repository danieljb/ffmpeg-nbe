
def iter_ports(node, direction):
    for port in node['ports']:
        if port.get('direction', 'out') != direction:
            continue
        yield port
 
def ff_filter_params(node):
    params = []
    for param in node.get('details', {}).get('params', []):
        value = param.get('value')
        if not value:
            continue
        if value == param.get('default'):
            continue
        params.append(param['id'] + '=' + value)
    return ':'.join(params)
 
def ff_filter_graph(graph, node='output', label=0, target=None):
    node = graph['vertices'][node]
    res = []
    targets = []
    for i, port in enumerate(iter_ports(node, 'in')):
        key = graph['edges'][port['edgeId']]['in']
        if i > 0:
            targets.append('[i%d_%d]' % (label, i))
            res.extend(ff_filter_graph(graph, key, label+1, targets[-1]))
        else:
            res.extend(ff_filter_graph(graph, key, label+1))
 
    filt = ''.join(targets) + node['label']
    params = ff_filter_params(node)
    if params:
        filt += '=' + params
    if target:
        filt += target
    res.append(filt)
    return res
 
def graph_to_filter_chain(graph):
    for k, v in graph['vertices'].items():
        for port in iter_ports(v, 'out'):
            graph['edges'][port['edgeId']]['in'] = k
    return ';'.join(ff_filter_graph(graph)[1:-1])
