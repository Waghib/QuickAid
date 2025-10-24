import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Help = () => {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const renderFAQItem = (id, question, answer) => {
    const isExpanded = expandedSection === id;
    return (
      <View style={styles.faqItem} key={id}>
        <TouchableOpacity 
          style={styles.faqQuestion}
          onPress={() => toggleSection(id)}
        >
          <Text style={styles.faqQuestionText}>{question}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Welcome to QuickAid</Text>
          <Text style={styles.helpText}>
            QuickAid is designed to provide emergency assistance when you need it most.
            Our app connects people in need with trained first responders nearby, while also
            offering comprehensive first aid training and certification.
          </Text>
          <Image 
            source={require('../assets/aid.jpg')} 
            style={styles.helpImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Getting Started</Text>
          <Text style={styles.helpSubtitle}>For Emergency Users:</Text>
          <Text style={styles.helpText}>
            1. Create an account with your phone number
          </Text>
          <Text style={styles.helpText}>
            2. Complete your profile with essential medical information
          </Text>
          <Text style={styles.helpText}>
            3. Familiarize yourself with the emergency request button
          </Text>
          <Text style={styles.helpText}>
            4. Take time to watch training videos to learn basic first aid skills
          </Text>
          
          <Text style={styles.helpSubtitle}>For First Responders:</Text>
          <Text style={styles.helpText}>
            1. Register as a first responder with your credentials
          </Text>
          <Text style={styles.helpText}>
            2. Complete verification process
          </Text>
          <Text style={styles.helpText}>
            3. Set your availability status
          </Text>
          <Text style={styles.helpText}>
            4. Respond to emergency requests in your vicinity
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Requesting Emergency Help</Text>
          <Text style={styles.helpText}>
            To request emergency assistance, tap the "Request for help" button on the home screen.
            Your location will be shared with nearby responders who can provide assistance.
          </Text>
          <Text style={styles.helpSubtitle}>What happens when you request help:</Text>
          <Text style={styles.helpText}>
            1. Your location is pinpointed on the map
          </Text>
          <Text style={styles.helpText}>
            2. Nearby first responders are notified
          </Text>
          <Text style={styles.helpText}>
            3. A responder accepts your request and heads to your location
          </Text>
          <Text style={styles.helpText}>
            4. You can track the responder's arrival in real-time
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Training Videos</Text>
          <Text style={styles.helpText}>
            Our comprehensive training section includes videos covering essential first aid skills and emergency procedures.
            Each video is designed to provide clear, step-by-step instructions for various emergency situations.
          </Text>
          <Text style={styles.helpSubtitle}>Training Features:</Text>
          <Text style={styles.helpText}>
            • Progress tracking to monitor your learning
          </Text>
          <Text style={styles.helpText}>
            • Visual indicators for completed videos
          </Text>
          <Text style={styles.helpText}>
            • Comprehensive coverage of first aid topics
          </Text>
          <Text style={styles.helpText}>
            • Content created by medical professionals
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Certification Process</Text>
          <Text style={styles.helpText}>
            Becoming certified through QuickAid demonstrates your commitment to emergency preparedness and first aid skills.
          </Text>
          <Text style={styles.helpSubtitle}>How to get certified:</Text>
          <Text style={styles.helpText}>
            1. Complete 100% of the training videos
          </Text>
          <Text style={styles.helpText}>
            2. Request certification through the Certification screen
          </Text>
          <Text style={styles.helpText}>
            3. Attend an onsite assessment at a designated venue (you'll receive an email with test venue and date details)
          </Text>
          <Text style={styles.helpText}>
            4. Demonstrate practical skills during the onsite assessment
          </Text>
          <Text style={styles.helpText}>
            5. Receive your digital certificate once approved
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Essential First Aid Tips</Text>
          
          <Text style={styles.helpSubtitle}>CPR Basics:</Text>
          <Text style={styles.helpText}>
            • Check for responsiveness and call for emergency services
          </Text>
          <Text style={styles.helpText}>
            • Place hands in center of chest and compress at least 2 inches deep
          </Text>
          <Text style={styles.helpText}>
            • Perform compressions at a rate of 100-120 per minute
          </Text>
          <Text style={styles.helpText}>
            • Allow complete chest recoil between compressions
          </Text>
          
          <Text style={styles.helpSubtitle}>Choking:</Text>
          <Text style={styles.helpText}>
            • Stand behind the person and wrap your arms around their waist
          </Text>
          <Text style={styles.helpText}>
            • Make a fist with one hand and place it above the navel
          </Text>
          <Text style={styles.helpText}>
            • Grasp your fist with your other hand and pull inward and upward
          </Text>
          <Text style={styles.helpText}>
            • Repeat until the object is expelled
          </Text>
          
          <Text style={styles.helpSubtitle}>Bleeding Control:</Text>
          <Text style={styles.helpText}>
            • Apply direct pressure to the wound with a clean cloth
          </Text>
          <Text style={styles.helpText}>
            • Elevate the injured area above the heart if possible
          </Text>
          <Text style={styles.helpText}>
            • Apply pressure until bleeding stops
          </Text>
          <Text style={styles.helpText}>
            • Apply a clean bandage once bleeding is controlled
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Account Management</Text>
          <Text style={styles.helpText}>
            You can manage your profile information and settings through the Account option in the side menu.
            Keep your contact information up to date to ensure you receive timely assistance.
          </Text>
          <Text style={styles.helpSubtitle}>Important account features:</Text>
          <Text style={styles.helpText}>
            • Update personal and emergency contact information
          </Text>
          <Text style={styles.helpText}>
            • Manage medical history and allergies
          </Text>
          <Text style={styles.helpText}>
            • View your training progress and certification status
          </Text>
          <Text style={styles.helpText}>
            • Set notification preferences
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Frequently Asked Questions</Text>
          
          {renderFAQItem(
            'faq1',
            'How does QuickAid find nearby responders?',
            'QuickAid uses GPS technology to locate first responders within a certain radius of your location. The system prioritizes responders based on proximity, availability, and qualifications to ensure the fastest possible assistance.'
          )}
          
          {renderFAQItem(
            'faq2',
            'Is my personal information secure?',
            'Yes, QuickAid takes data security very seriously. We use industry-standard encryption to protect your personal information. Medical data is only shared with responders during an active emergency request, and responders are bound by strict confidentiality agreements.'
          )}
          
          {renderFAQItem(
            'faq3',
            'How do I become a certified first responder?',
            'To become a certified first responder through QuickAid, you need to complete all training videos, then request certification. You\'ll receive an email with details about your onsite assessment venue and date. After successfully completing the assessment, you\'ll receive a digital certificate valid for 2 years.'
          )}
          
          {renderFAQItem(
            'faq4',
            'What should I do if no responders are available?',
            'If no responders are available in your area, the app will automatically provide you with first aid guidance relevant to your emergency and connect you with traditional emergency services (911/999/112) depending on your location.'
          )}
          
          {renderFAQItem(
            'faq5',
            'How often is the training content updated?',
            'Our training content is reviewed and updated quarterly by medical professionals to ensure it aligns with the latest first aid and emergency response guidelines from major health organizations.'
          )}
          
          {renderFAQItem(
            'faq6',
            'Can I use QuickAid while traveling internationally?',
            'Yes, QuickAid works internationally wherever you have internet connectivity. The app will automatically adjust to local emergency protocols and connect you with responders in your current location.'
          )}
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Contact Support</Text>
          <Text style={styles.helpText}>
            If you need additional assistance with the app, please contact our support team:
          </Text>
          <Text style={styles.contactInfo}>Email: support@quickaid.com</Text>
          <Text style={styles.contactInfo}>Phone: +1-800-QUICK-AID</Text>
          <Text style={styles.contactInfo}>Hours: 24/7 Emergency Support</Text>
          <Text style={styles.contactInfo}>Business Hours: Monday-Friday, 9 AM - 6 PM EST</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2B95E1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B95E1',
    marginBottom: 12,
  },
  helpSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 6,
  },
  helpImage: {
    width: '100%',
    height: 150,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  faqItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B95E1',
    marginLeft: 8,
  },
  faqAnswer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  contactInfo: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default Help;
