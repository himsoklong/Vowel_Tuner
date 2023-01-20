import math
import parselmouth
from parselmouth import praat




def extract_formant(filepath, start_time=0, end_time=1, f0min=75, f0max=300, n_formants=4):
    sound = parselmouth.Sound(filepath)
    pointProcess = praat.call(sound, "To PointProcess (periodic, cc)", f0min, f0max)
    formants = praat.call(sound, "To Formant (burg)", 0, n_formants + 1, 5000, 0.025, 50)
    numPoints = praat.call(pointProcess, "Get number of points")
    f_lists = [[] for i in range(n_formants)]
    for point in range(1, numPoints + 1):
        t = praat.call(pointProcess, "Get time from index", point)
        for i in range(n_formants):
            f_lists[i].append(praat.call(formants, "Get value at time", i + 1, t, 'Hertz', 'Linear'))

    f_lists = [[x for x in f_list if not math.isnan(x)] for f_list in f_lists]

    # compute the average of formants
    out = []
    for i in range(n_formants):
        out.append(sum(f_lists[i]) / len(f_lists[i]))

    return out


