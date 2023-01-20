def vowel_feedback(vowel_des, vowel_per):
    '''
    Function that compares two vowels and gives feedback in terms of tongue position, lip rounding and nasality.
    Input: desired vowel (string) and perceived vowel (string), for example: 'y' and 'u'
    Output: Tuple of strings. (nasality feedback, rounding feedback, openness feedback, frontness feedback)
    '''

    # vowel dictionary on the following format:
    # 'vowel: openness score (int, 0-6), frontness score (int, 0-4), rounded (boolean), nasality (boolean)'
    vowel_dict = {'i': [0, 4, False, False], 'y': [0, 4, True, False], 'e': [2, 4, False, False],
                  'E': [4, 4, False, False], 'a': [6, 4, False, False], 'u': [0, 0, True, False],
                  'o': [2, 0, True, False], 'O': [4, 0, True, False], '2': [2, 4, True, False],
                  '9': [4, 4, True, False], '@': [3, 2, False, False], 'A~': [6, 0, False, True],
                  'E~': [6, 4, False, True], 'O~': [4, 0, True, True]}

    # parameters of desired vowel
    openness_des = vowel_dict[vowel_des][0]
    frontness_des = vowel_dict[vowel_des][1]
    rounded_des = vowel_dict[vowel_des][2]
    nasal_des = vowel_dict[vowel_des][3]

    # parameters of perceived vowel
    openness_per = vowel_dict[vowel_per][0]
    frontness_per = vowel_dict[vowel_per][1]
    rounded_per = vowel_dict[vowel_per][2]
    nasal_per = vowel_dict[vowel_per][3]

    ##################################### TIME FOR FEEDBACK #####################################

    feedback_dict = {'openness': ['Close your mouth more!', 'Open your mouth more!'],
                     'frontness': ['Raise the back of your tongue!', 'Raise the front of your tongue!'],
                     'rounding': ['Round your lips!', "Don't round your lips!"],
                     'nasality': ['Nasalize!', "Don't nasalize!"]}

    # feedback messages
    o_feedback = ''  # openness
    f_feedback = ''  # frontness
    r_feedback = ''  # rounding
    n_feedback = ''  # nasality

    # Checking openness
    if openness_per > openness_des:
        o_feedback = feedback_dict['openness'][0]
    elif openness_per < openness_des:
        o_feedback = feedback_dict['openness'][1]

    # Checking frontness
    if frontness_per > frontness_des:
        f_feedback = feedback_dict['frontness'][0]
    elif frontness_per < frontness_des:
        f_feedback = feedback_dict['frontness'][1]

    # Checking rounding
    if rounded_per == False != rounded_des:
        r_feedback = feedback_dict['rounding'][0]
    elif rounded_per == True != rounded_des:
        r_feedback = feedback_dict['rounding'][1]

    # Checking nasality
    if nasal_per == False != nasal_des:
        n_feedback = feedback_dict['nasality'][0]
    elif nasal_per == True != nasal_des:
        n_feedback = feedback_dict['nasality'][1]

    # returns tuple with four values
    return n_feedback, r_feedback, o_feedback, f_feedback


def pron_hack(vowel_des, vowel_per):
    '''
    Provides more in-depth feedback for some of the vowels.
    Input: desired vowel (string) and perceived vowel (string), for example: 'y' and 'u'
    Output: string, for example "Protrude your lips like in a kiss."
    If no advice exists, the function returns an empty string.
    '''

    hack_dict = {
        'x_to_y': "Try saying “tea” in English. Now keep your tongue in the same position but protrude your lips like in a kiss.",
        'x_to_2': "Try saying the vowel in “beer”. Now keep your tongue in the same position, but round your lips as if saying “pool”.",
        'x_to_9': "Try saying the vowel in “care”. Now keep your tongue in the same position, but round your lips as if saying “pool”.",
        'e_to_E': "'è lies right in between é and 'a' as in French 'ta'. Move your vowel closer to 'a' by opening your mouth slightly.",
        'E_to_e': "'é lies right in between è and i as in French 'si'. Move your vowel closer to 'i' by closing your mouth slightly.",
        'o_to_O': "Keep in mind that the o-sound in 'sot' and 'sort' are different. For 'sort' the mouth is a bit more open.",
        'O_to_o': "Keep in mind that the o-sound in 'sot' and 'sort' are different. For 'sot' the mouth is a bit more closed.",
        'nasal_OA': "For nasal vowels, some air passes through the nose. Try to say “long” but only softly humming the ng-sound.",
        'nasal_E': "For nasal vowels, some air passes through the nose. Try to say “bang” but only softly humming the ng-sound."}
    pronhack = ''
    if vowel_des == 'y':
        pronhack = hack_dict['x_to_y']
    elif vowel_des == '2':
        pronhack = hack_dict['x_to_2']
    elif vowel_des == '9':
        pronhack = hack_dict['x_to_9']
    elif vowel_des == 'E' and vowel_per == 'e':
        pronhack = hack_dict['e_to_E']
    elif vowel_des == 'e' and vowel_per == 'E':
        pronhack = hack_dict['E_to_e']
    elif vowel_des == 'o' and vowel_per == 'O':
        pronhack = hack_dict['O_to_o']
    elif vowel_des == 'O' and vowel_per == 'o':
        pronhack = hack_dict['o_to_O']
    elif (vowel_des == 'O~' or vowel_des == 'A~') and vowel_per[-1] != '~':
        pronhack = hack_dict['nasal_OA']
    elif vowel_des == 'E~' and vowel_per[-1] != '~':
        pronhack = hack_dict['nasal_E']

    return pronhack